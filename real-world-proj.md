# Real-world pipeline

> ### 📚 Documentation Hub
> - 📘 **GitHub Actions Core Guide**: [Readme.md](Readme.md)
> - 🚀 **DevOps Demo Architecture & Setup**: [architecture.md](architecture.md)
> - 🌿 **Git & Branching Workflow**: [GIT.md](GIT.md)
> - 🛡️ **DevSecOps Architecture & Policy**: [SECURITY.md](SECURITY.md)
> - ⚠️ **Gotchas & Critical Notes**: [note.md](note.md)
> - 🏗️ **Real-World Pipeline Blueprint**: [real-world-proj.md](real-world-proj.md)

---

```yaml
lint ──▶ test (matrix) ──▶ build-images (matrix: api, worker) ──▶ deploy-staging ──▶ deploy-prod (approval)
```

**.github/workflows/ci.yml**

```yaml
name: ci

on:
  push:
    branches: [main]
    paths-ignore: ["**.md"]
  pull_request:
  workflow_dispatch:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

permissions:
  contents: read

jobs:
  lint:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v6
      - run: pip install yamllint check-jsonschema
      - run: yamllint --strict -f github .
      - run: check-jsonschema --builtin-schema vendor.github-workflows .github/workflows/*.yml

  test:
    needs: lint
    runs-on: ${{ matrix.os }}
    timeout-minutes: 15
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [20, 22]
        include:
          - os: ubuntu-latest
            node: 22
            coverage: true
    steps:
      - uses: actions/checkout@v6
      - uses: ./.github/actions/setup-app
        with:
          node-version: ${{ matrix.node }}
      - run: npm test
      - if: matrix.coverage
        run: npm run coverage

  build-images:
    needs: test
    if: github.ref == 'refs/heads/main'
    strategy:
      matrix:
        service: [api, worker]
    permissions:
      contents: read
      packages: write
    uses: ./.github/workflows/build-image.yml
    with:
      service: ${{ matrix.service }}

  deploy-staging:
    needs: build-images
    uses: ./.github/workflows/deploy.yml
    with:
      environment: staging
      tag: ${{ github.sha }}
    secrets:
      KUBE_CONFIG: ${{ secrets.KUBE_CONFIG_STAGING }}

  deploy-prod:
    needs: deploy-staging
    uses: ./.github/workflows/deploy.yml
    with:
      environment: prod
      tag: ${{ github.sha }}
    secrets:
      KUBE_CONFIG: ${{ secrets.KUBE_CONFIG_PROD }}

  ci-ok:
    if: ${{ always() }}
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - run: |
          if [ "${{ contains(needs.*.result, 'failure') || contains(needs.*.result, 'cancelled') }}" = "true" ]; then
            exit 1
          fi
```

#### Notes:

- **The `prod` environment has required reviewers configured in the repo settings, so `deploy-prod` waits for a human to approve.**
- **We use `if: github.ref == 'refs/heads/main'` to restrict image builds to the main branch only, matching the earlier diagram.**
- **The ci-ok job runs last and will only pass if all previous jobs succeeded. This is a simple way to track overall pipeline health.**
- **We use `concurrency` to prevent multiple runs of the same workflow from running at the same time on the same branch.**

**.github/workflows/deploy.yml**

```yaml
name: deploy

on:
  workflow_call:
    inputs:
      environment:
        type: string
        required: true
      tag:
        type: string
        required: true
    secrets:
      KUBE_CONFIG:
        required: true

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    environment: ${{ inputs.environment }}
    concurrency:
      group: deploy-${{ inputs.environment }}
      cancel-in-progress: false
    steps:
      - uses: actions/checkout@v6
      - name: Configure kubectl
        env:
          KUBE_CONFIG: ${{ secrets.KUBE_CONFIG }}
        run: |
          mkdir -p ~/.kube
          printf '%s' "$KUBE_CONFIG" > ~/.kube/config
          chmod 600 ~/.kube/config
      - name: Pin image tag and validate
        env:
          TARGET: ${{ inputs.environment }}
          TAG: ${{ inputs.tag }}
        run: |
          cd "k8s/overlays/$TARGET"
          kustomize edit set image "app=ghcr.io/${GITHUB_REPOSITORY,,}/api:${TAG}"
          kustomize build . | kubeconform -strict -summary -ignore-missing-schemas -
      - name: Apply and wait
        env:
          TARGET: ${{ inputs.environment }}
        run: |
          kubectl apply -k "k8s/overlays/$TARGET"
          kubectl rollout status deployment/demo -n "$TARGET" --timeout=120s
```

## Project Structure:

```yaml

devops-demo/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # caller: lint, test matrix, build, deploy
│   │   ├── build-image.yml         # reusable: build and push one service
│   │   ├── deploy.yml              # reusable: deploy one environment
│   │   └── security.yml            # CodeQL, dependency review, gitleaks
│   ├── actions/
│   │   └── setup-app/
│   │       └── action.yml          # composite action
│   └── dependabot.yml              # keeps actions up to date
├── config/
│   └── services.yaml               # drives the dynamic matrix
├── services/
│   ├── api/Dockerfile
│   └── worker/Dockerfile
├── k8s/
│   ├── base/
│   └── overlays/ staging/ prod/
├── .yamllint                       # truthy: {check-keys: false}
└── .pre-commit-config.yaml         # yamllint, actionlint

```

#### .github/workflows/ci.yml

```yaml
name: ci

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

env:
  NODE_ENV: dev

jobs:
  lint:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v6
      - uses: ./.github/actions/setup-app
        with:
          node-version: "22"
          service: "api"
      - run: pip install yamllint check-jsonschema
      - run: yamllint --strict -f github .
      - run: check-jsonschema --builtin-schema vendor.github-workflows .github/workflows/*.yml

  test:
    needs: lint
    runs-on: ${{ matrix.os }}
    timeout-minutes: 15
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [20, 22]
        include:
          - os: ubuntu-latest
            node: 22
            coverage: true
    steps:
      - uses: actions/checkout@v6
      - uses: ./.github/actions/setup-app
        with:
          node-version: ${{ matrix.node }}
      - run: npm test
      - if: matrix.coverage
        run: npm run coverage

  build-images:
    needs: test
    if: github.ref == 'refs/heads/main'
    strategy:
      matrix:
        service: [api, worker]
    permissions:
      contents: read
      packages: write
    uses: ./.github/workflows/build-image.yml
    with:
      service: ${{ matrix.service }}

  deploy-staging:
    needs: build-images
    uses: ./.github/workflows/deploy.yml
    with:
      environment: staging
      tag: ${{ github.sha }}
    secrets:
      KUBE_CONFIG: ${{ secrets.KUBE_CONFIG_STAGING }}

  deploy-prod:
    needs: deploy-staging
    uses: ./.github/workflows/deploy.yml
    with:
      environment: prod
      tag: ${{ github.sha }}
    secrets:
      KUBE_CONFIG: ${{ secrets.KUBE_CONFIG_PROD }}

  ci-ok:
    if: ${{ always() }}
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - run: |
          if [ "${{ contains(needs.*.result, 'failure') || contains(needs.*.result, 'cancelled') }}" = "true" ]; then
            exit 1
          fi
```

#### .github/workflows/deploy.yml

```yaml
name: deploy

on:
  workflow_call:
    inputs:
      environment:
        type: string
        required: true
      tag:
        type: string
        required: true
    secrets:
      KUBE_CONFIG:
        required: true

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    environment: ${{ inputs.environment }}
    concurrency:
      group: deploy-${{ inputs.environment }}
      cancel-in-progress: false
    steps:
      - uses: actions/checkout@v6
      - name: Configure kubectl
        env:
          KUBE_CONFIG: ${{ secrets.KUBE_CONFIG }}
        run: |
          mkdir -p ~/.kube
          printf '%s' "$KUBE_CONFIG" > ~/.kube/config
          chmod 600 ~/.kube/config
      - name: Pin image tag and validate
        env:
          TARGET: ${{ inputs.environment }}
          TAG: ${{ inputs.tag }}
        run: |
          cd "k8s/overlays/$TARGET"
          kustomize edit set image "app=ghcr.io/${GITHUB_REPOSITORY,,}/api:${TAG}"
          kustomize build . | kubeconform -strict -summary -ignore-missing-schemas -
      - name: Apply and wait
        env:
          TARGET: ${{ inputs.environment }}
        run: |
          kubectl apply -k "k8s/overlays/$TARGET"
          kubectl rollout status deployment/demo -n "$TARGET" --timeout=120s
```

#### .github/workflows/build-image.yml

```yaml
name: build-image

on:
  workflow_call:
    inputs:
      service:
        type: string
        required: true
    secrets:
      CR_PAT:
        required: true

permissions:
  contents: read
  packages: write

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v6
      - uses: ./.github/actions/setup-app
        with:
          service: ${{ inputs.service }}
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.CR_PAT }}
      - name: Build and push Docker image
        uses: docker/build-push-action@v6
        with:
          context: services/${{ inputs.service }}
          push: true
          tags: ghcr.io/${{ github.repository,, }}/${{ inputs.service }}:${{ github.sha }}
```

#### .github/workflows/security.yml

```yaml
name: security

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 0 * * 1" # Weekly on Monday

permissions:
  contents: read

jobs:
  codeql:
    name: CodeQL Scan
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v6
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript
      - name: Auto-detect code scanning query suites
        uses: github/codeql-action/autobuild@v3
      - name: Perform CodeQL analysis
        uses: github/codeql-action/analyze@v3

  dependency-review:
    name: Dependency Review
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/dependency-review-action@v4

  gitleaks:
    name: Gitleaks Scan
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v6
      - name: Gitleaks Scan
        uses: gitleaks/gitleaks-action@v4
        with:
          fail-on-secrets: true
```

#### .github/actions/setup-app/action.yml

```yaml
name: "setup-app"

description: "Setup Node.js and install dependencies"

inputs:
  node-version:
    description: "Node.js version"
    required: true
  service:
    description: "Service to set up"
    required: true

runs:
  using: "composite"
  steps:
    - name: Checkout code
      uses: actions/checkout@v6
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
    - name: Install dependencies
      run: npm ci
      working-directory: services/${{ inputs.service }}
    - name: Run automated tests
      run: npm test
      working-directory: services/${{ inputs.service }}
```
