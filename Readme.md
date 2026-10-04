# GitHub Action: Workflow, Matrix, Reusable Workflows

> ### 📚 Documentation Hub
> - 📘 **GitHub Actions Core Guide**: [Readme.md](Readme.md)
> - 🚀 **DevOps Demo Architecture & Setup**: [architecture.md](architecture.md)
> - 🌿 **Git & Branching Workflow**: [GIT.md](GIT.md)
> - 🛡️ **DevSecOps Architecture & Policy**: [SECURITY.md](SECURITY.md)
> - ⚠️ **Gotchas & Critical Notes**: [note.md](note.md)
> - 🏗️ **Real-World Pipeline Blueprint**: [real-world-proj.md](real-world-proj.md)

---

## GitHub Action:

GitHub Action is built-in-continuous integration and continuous delivery (CI/CD) and automation platform that we to automate our software development workflows directly inside our GitHub repository.

We can use it to automatically build, test, and deploy our code as well as triage issues, manage pull requests, manage branches, send notifications, and more.

```yaml
# Idea Model

event (push, PR, schedule...) ──▶ workflow ──▶ jobs (parallel by default) ──▶ steps (sequential)
```

### Core Components of GitHub Actions:

- **Workflow**: A workflow is an automated process that you can set up to build, test, and deploy our code. It is made up of one or more jobs, and each job is made up of one or more steps. A workflow is triggered by an event, such as a push or a pull request. YAML files define workflows and must be stored in the .github/workflows directory.

- **Event**: An event is a specific activity that triggers a workflow, such as a push, a pull request, or a schedule.

- **Job**: A job is a set of steps that are executed together, such as building the code or running tests. A job can run on a runner, which is a server that runs the job. A runner can be a **GitHub-hosted runner** or a **self-hosted runner**. Runs on its own fresh runner(vm).

- **Step**: A step is a single command that is executed as part of a job, such as `npm install` or `npm test`. Steps are executed in order from top to bottom. Each step can be a shell command or an action.

- **Runner**: A runner is a server that runs the job. A runner can be a **GitHub-hosted runner** or a **self-hosted runner**.

- **Action**: An action is a reusable unit of code that can be used in a workflow. Actions can be used to perform common tasks, such as checking out the code or logging in to a service.

### Key Features of GitHub Actions:

- **Triggers**: Workflows can be triggered by a variety of events, including push events, pull request events, and schedule events.

- **Matrix Builds**: GitHub Actions supports matrix builds, which allow we to run the same workflow on multiple operating systems and environments.

- **Environment Variables**: We can define environment variables for our workflows, which can be used to configure our workflows.

- **Secrets**: We can store secrets in GitHub Actions, which are sensitive values that can be used to configure our workflows.

- **Reusable Workflows**: We can use the same workflow in multiple repositories, which can save time and effort.

### Example :

`a standard .github/workflows/ci.yml template that runs a basic continuous integration pipeline every time code is pushed to the main branch`

```yaml
name: Node.js CI

# 1. Define what triggers the workflow
on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]

# 2. Token rights - if you are using private repo, you need to give token rights to the workflow

permissions:
  contents: read

# 3. Environment variables
env:
  NODE_ENV: dev

# 4. Define the jobs to run
jobs:
  build-and-test:
    # Specify the operating system environment
    runs-on: ubuntu-latest # runner labels - ubuntu-latest, windows-latest,macos-latest, self-hosted

    # Sequence of tasks to execute
    steps:
      # Step 1: Check out your repository's code onto the runner
      - name: Checkout code
        uses: actions/checkout@v4

      # Step 2: Set up a runtime environment using a pre-built Action
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      # Step 3: Run standard terminal shell commands
      - name: Install dependencies
        run: npm ci

      - name: Run automated tests
        run: npm test
```

## key using in workflow:

- **name**: The name of the workflow.

- **on**: The events that trigger the workflow.

- **permissions**: The permissions for the workflow.

- **env**: The environment variables for the workflow.

- **jobs**: The jobs to run in the workflow.

- **runs-on**: The operating system environment for the job.

- **steps**: The steps to run in the job.

- **uses**: The action to use in the step.

- **with**: The inputs for the action.

- **run**: The command to run in the step.

### key keywords in workflow:

| Keyword                          | Location            | Description                                 | Example |
| :------------------------------- | :------------------ | :------------------------------------------ | :------ |
| **name**                         | workflow, job, step | Display name                                |
| **on**                           | workflow            | Triggers                                    |
| **permissions**                  | workflow, job       | GITHUB_TOKEN scopes                         |
| **env**                          | workflow, job, step | Environment variables                       |
| **concurrency**                  | workflow, job       | Serialize or cancel runs                    |
| **defaults.run**                 | workflow, job       | Default shell and working-directory         |
| **jobs.<id>.runs-on**            | job                 | Runner label                                |
| **jobs.<id>.needs**              | job                 | Wait for other jobs                         |
| **jobs.<id>.if**                 | job                 | Run conditionally                           |
| **jobs.<id>.strategy**           | job                 | Matrix                                      |
| **jobs.<id>.outputs**            | job                 | Values for later jobs                       |
| **jobs.<id>.environment**        | job                 | Deployment environment (approvals, secrets) |
| **jobs.<id>.timeout-minutes**    | job                 | Kill hung jobs (default is 360!)            |
| **steps[].uses / run**           | step                | An action, or a shell script                |
| **steps[].with / env / if / id** | step                | Inputs, env, condition, name for outputs    |

### `Run:` and yaml block scalars:

We can use three types of yaml block scalars to write the commands in the `run` key:

1. **Literal Block Scalar (`|`)**:

- preserves the newlines in the string.

2. **Folded Block Scalar (`>`)**:

- preserves the newlines in the string but folds the newlines into a single space.

3. **Literal Block Scalar (`|`) with Pipe-star chomping (`|-`)**:

- preserves the newlines in the string but removes the trailing newline.

4. **Literal Block Scalar (`|`) with Plus-star chomping (`|+`)**:
   - preserves the newlines in the string but removes the trailing and leading newlines.

Example:

```yaml
# Literal Block Scalar (`|`)
run: |
  echo "Hello World"
  echo "This is a multi-line string"

# Folded Block Scalar (`>`)
run: >
  echo "Hello World"
  echo "This is a multi-line string"

# Literal Block Scalar (`|`) with Pipe-star chomping (`|-`)
run: |-
  echo "Hello World"
  echo "This is a multi-line string"

# Literal Block Scalar (`|`) with Plus-star chomping (`|+`)
run: |+
  echo "Hello World"
  echo "This is a multi-line string"

- run: npm ci && npm test            # one line

- run: |                             # several commands (literal block)
    npm ci
    npm test

- run: >-                            # one long command folded into a line
    docker build
    --build-arg VERSION=1.0
    -t myapp .

```

### `run:` without `shell:` uses `bash -e`, which has no `pipefail`. A faillure inside a pipe is hidden. Use `shell: bash` (which adds `-o pipefail` flag) or set it once in `defaults` section.

```yaml
defaults:
  run:
    shell: bash
```

### Triggers (`on:`)

1. **push** : Runs when code is pushed to the repository.
2. **pull_request** : Runs when a pull request is opened or updated reopened, edited, synchronized, assigned, labeled, ready_for_review, review_requested, etc.
3. **workflow_dispatch** : Runs when a workflow is triggered manually (button on the UI, API, gh CLI).
4. **schedule** : Runs at a specified time (cron expression , UTC).
5. **repository_dispatch** : Runs when a repository_dispatch event is dispatched (webhook) / External API call.
6. **workflow_run** : Runs when another workflow is completed.
7. **release** : Runs when a release is published, created, edited, deleted, etc.
8. **workflow_call** : Runs when another workflow calls this workflow.
9. **pull_request_target** : Runs when a pull request is opened or updated reopened, edited, synchronized, assigned, labeled, ready_for_review, review_requested, etc. This trigger runs in the context of the base repository.
10. **issue_comment** : Runs when an issue comment is created, edited, deleted, etc.
11. **pull_request_review** : Runs when a pull request review is requested, submitted, or updated.

### Filters

combining `paths` and `branches` means both must match.

```yaml
on:
  push:
    branches: [main, "release/*"]
    tags: ["v*"]
    paths:
      - "src/**"
      - "package*.json"

  pull_request:
    paths-ignore:
      - "docs/**"
      - "*.md"
```

## YAML traps in triggers:

1. Always quote the key `on`, `push`, `pull_request`, etc. ensures the value is interpreted as a string.

2. Quote any pattern that starts with `*`, `!`, `&`, or contains `:` .

3. Never use `"` on the place of `'` or vice versa.

```yaml
# YAML traps in triggers
on:
  schedule:
    - cron: */15 0 * * *  # Wrong -cron: "*/15 0 * * *"
    - cron: "*/15 * * * *"  # Right

  push:
    paths:
      - *.md    # WRONG: alias again
      - "*.md"  # Right
      - !docs/**  # WRONG: ! starts a YAML tag
      - "!docs/**" # Right

```

**Best Practice**:

```yaml
on:
  push:
    branches: ["development", "staging", "release/*"]
    tags: ["v*", "beta-*"]
  pull_request:
    branches: ["development"]
```

## Mannual runs with inputs

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: Target environment
        type: choice
        options: [staging, prod]
        default: staging
      dry_run: # raal boolean
        description: Skip the real deploy
        type: boolean
        default: true
```

```yaml
# using inputs in a job:

- run: echo "env=$TARGET dry=$DRY"
  env:
    TARGET: ${{ inputs.environment }}
    DRY: ${{ inputs.dry_run }}
```

```bash
# Run with inputs
gh workflow run ci.yml -f environment=prod -f dry_run=false

```

## Expressions, Contexts, Outputs

**` ${{ }}`** and contents

- **`${{ expressions }}`** - Use expressions to evaluate runtime values.

- **`${{ contains(join(github.event.pull_request.labels.*.name, ''), 'urgent') }}`** - Use contexts to access runtime values.

### Contents

| Context     | Contents                                                               |
| ----------- | ---------------------------------------------------------------------- |
| **github**  | Event, repo, ref, sha, actor (`github.sha`, `github.ref_name`)         |
| **env**     | Env vars set in the workflow (`env.CACHE_DIR`)                         |
| **vars**    | Repo/org/environment variables (non-secret config) (`vars.DEPLOY_ENV`) |
| **secrets** | Secrets (masked in logs) (`secrets.DOCKER_PASSWORD`)                   |
| **inputs**  | workflow_dispatch and workflow_call inputs (`inputs.environment`)      |
| **matrix**  | Current matrix combination (`matrix.os`)                               |
| **needs**   | Outputs and results of earlier jobs                                    |
| **steps**   | Outputs and outcomes of earlier steps                                  |
| **runner**  | OS, arch, temp dir                                                     |

## Functions

**contains** / **startsWith** / **endsWith**

```yaml
contains(github.ref, 'refs/tags/') # check if a string contains a substring
startsWith(github.ref, 'refs/tags/') # check if a string starts with a prefix
endsWith(github.ref, 'refs/tags/') # check if a string ends with a suffix
```

**format / join**

```yaml
format('{0}-{1}', a, b) # form a string
join(list, separator) # join a list
```

**toJSON / fromJSON**

```yaml
fromJSON(toJSON(matrix.result)) # for Matrix from JSON
```

**hashFiles**

```yaml
hashFiles('**/package-lock.json') # for cache keys
```

**success() / failure() / always() / cancelled()**

```yaml
success() # check if a job succeeded
failure() # check if a job failed
always() # always true
cancelled() # check if a job was cancelled
```

## Conditions

```yaml
if: github.event.pull_request.labels.size == 0 # if no labels are present
if: success() # if the previous job succeeded
if: failure() # if the previous job failed
if: always() # always true
if: cancelled() # if the previous job was cancelled

# using contexts
if: github.event.pull_request.draft == false # if the pull request is not a draft
if: github.actor == "your-username" # if the actor is your username

if: github.ref == 'refs/heads/main' && github.event_name == 'push'   # ${{ }} optional here
if: ${{ !cancelled() }}                # needs ${{ }} because ! starts a YAML tag
if: always()                           # run even after failures
if: failure()                          # only after a failure
if: matrix.coverage                    # false when the key doesn't exist for this combination
```

**Note**: in an expression `${{...}}`, the `!`, `&&`, `||` must be escaped with backslash `\`. So `if: !cancelled()` without `${{ }}` is a YAML syntax error.

## Steps pass data with files, not return values

```yaml
steps:
  - id: version
    run: echo "tag=$(git describe --tags --always)" >> "$GITHUB_OUTPUT"
  - name: Use it
    env:
      TAG: ${{ steps.version.outputs.tag }}
    run: echo "Deploying $TAG"
```

### Files for passing data

| File                   | Use                                              |
| ---------------------- | ------------------------------------------------ |
| `$GITHUB_OUTPUT`       | `name=value` output for later steps and jobs     |
| `$GITHUB_ENV`          | `NAME=value` env var for later steps in this job |
| `$GITHUB_PATH`         | Add a directory to PATH                          |
| `$GITHUB_STEP_SUMMARY` | Markdown shown on the run page                   |

**Note**: The old `::set-output` command is deprecated. Always append to `$GITHUB_OUTPUT`.

### Multi-line values need a delimiter

```yaml
steps:
  - run: |
      echo "message<<EOF
      Line 1
      Line 2
      Line 3
      EOF" >> $GITHUB_OUTPUT
  - run: echo "${{ steps.output.outputs.message }}"

  - run: |
    {
      echo "key1=value1"
      echo "key2=value2"
    } >> "$GITHUB_OUTPUT"

# multi-line values need quotes
# use `>>` not `>`
# you can use env and path in the same way

```

### Outputs Between jobs

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.v.outputs.version }}
    steps:
      - id: v
        run: echo "version=1.4.2" >> "$GITHUB_OUTPUT"

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - env:
          VERSION: ${{ needs.build.outputs.version }}
        run: echo "deploying $VERSION"
```

### Files move between jobs with artifacts

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: dist
    path: dist/
# in another job:
- uses: actions/download-artifact@v4
  with:
    name: dist
```

### Vatiable vs Secrets

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      # secrets for this job only
      API_KEY: ${{ secrets.API_KEY }}
      # repo/org secret - available to all jobs in repo/org
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
    steps:
      - uses: actions/checkout@v4
      - name: Validate API Key
        run: echo "{{ secrets.API_KEY }}" | grep '^[a-zA-Z0-9]*$' # example validation
```

```yaml
env:
  API_URL: ${{ vars.API_URL }} # plain config
steps:
  - run: ./deploy.sh
    env:
      API_TOKEN: ${{ secrets.API_TOKEN }} # masked, give it only to the step that needs it
```

## Matrix Strategy

Run the same job in different versions of a tool or OS.

```yaml
jobs:
  test:
    strategy:
      matrix:
        os:
          - ubuntu-latest
          - windows-latest
          - macos-latest
        node-version:
          - 18
          - 20
          - 22
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"
      - run: npm ci
      - run: npm test
```

**OR**

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      max-parallel: 4
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [20, 22]
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci && npm test
```

**Note**: This creates 2 × 2 = 4 jobs, named test (ubuntu-latest, 20), test (ubuntu-latest, 22), test (windows-latest, 20) and test (windows-latest, 22).

- **Key and its value meanings:**

- `matrix.<key>` - matrix combination key (os, node, etc.)
- `matrix.<key>.*` - matrix combination value
- `fail-fast` - if true, stop all jobs when any job fails, Default true: one failure cancels the rest. Set false to see all results.
- `max-parallel` - maximum number of jobs to run in parallel. Default is the number of jobs in the matrix.

- `include` - Add extra keys to a combination, or add a new combination.
- `exclude` - Exclude some combinations based on conditions or Remove combinations.

- `max-size` - 256 jobs per matrix.

**Note**: Avoid using versions in matrix keys that can break the workflow. Example:

```yaml
py-version: [3.9, 3.10, 3.11] # 3.10 is parsed as float 3.1!
py-version: ['3.9', '3.10', '3.11'] # This is the correct way
```

**Note**: Integer like `node: [16, 18, 20]` is ok. Anything with a dot `.` need to be quoted.\*\*

### Include and Exclude

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
        include:
          - node-version: 16
            npm-version: 8
          - node-version: 18
            npm-version: 9
          - node-version: 20
            npm-version: 10
        exclude:
          - node-version: 16
            npm-version: 8
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          npm-version: ${{ matrix.npm-version }}
      - run: npm ci && npm test
```

**OR**

```yaml
matrix:
  os: [ubuntu-latest, windows-latest]
  node: [20, 22]
  exclude:
    - os: windows-latest
      node: 20 # skip this one combination
  include:
    - os: ubuntu-latest
      node: 22
      coverage: true # adds a key to the matching combination
    - os: ubuntu-latest
      node: 24
      experimental: true # no match, so it becomes a new job
```

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      max-parallel: 2
      matrix:
        test_env: ["default", "no-color", "unicode", "with-color"]

    # Example of using a matrix variable to control behavior
    continue-on-error: ${{ matrix.test_env == 'no-color' }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: npm ci

      # Example: Conditional run based on matrix value
      - name: Run unit tests with color (default)
        if: matrix.test_env == 'default' || matrix.test_env == 'unicode' || matrix.test_env == 'with-color'
        run: npm test

      - name: Run unit tests without color
        if: matrix.test_env == 'no-color'
        env:
          NO_COLOR: 1 # Example environment variable
        run: npm test

      - name: Run Unicode tests
        if: matrix.test_env == 'unicode'
        run: npm test -- --unicode

      - name: Run all tests with color
        if: matrix.test_env == 'with-color'
        run: npm test -- --with-color
```

### Matrix from a list of maps

```yaml
matrix:
  include:
    - name: api
      path: services/api
    - name: worker
      path: services/worker
steps:
  - run: docker build services/...
    working-directory: ${{ matrix.path }}
```

### Dyanmic Matrix (needs a job output)

**config/services.yaml**

```yaml
services:
  - name: api
  - name: worker
```

**jobs/.github/workflows/deploy.yaml**

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      services: ${{ steps.set.outputs.services }}
    steps:
      - uses: actions/checkout@v6
      - id: set
        run: |
          echo 'services<<EOF'
          cat config/services.yaml
          echo 'EOF' >> $GITHUB_OUTPUT

        # run: echo "services=$(yq -o=json -I=0 '[.services[].name]' config/services.yaml)" >> "$GITHUB_OUTPUT"

  deploy:
    needs: build
    # if: needs.build.outputs.services != '[]'
    runs-on: ubuntu-latest
    strategy:
      matrix: ${{ needs.build.outputs.services }}
    steps:
      - run: echo "Deploying ${{ matrix.name }}"
```

### one status check for branch protection

Matrix jobs have many names, and `paths`-filtered workflows that get skipped leave required checks stuck on "Pending". Use one gate job:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"
      - run: npm ci
      - run: npm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"
      - run: npm ci
      - run: npm run build

  ci-ok:
    if: ${{ always() }}
    needs: [lint, test, build]
    runs-on: ubuntu-latest
    steps:
      - run: |
          if [ "${{ contains(needs.*.result, 'failure') || contains(needs.*.result, 'cancelled') }}" = "true" ]; then
            echo "a required job failed"; exit 1
          fi
```

**Note**: Make `ci-ok` the only required check. The `${{ }}` here is computed from job results, not user input, so it's safe.

## Reusable workflows

A reusable workflow is a workflow that can be reused by other workflows.

Triggering methods:

- **Triggered directly**: `run: uses: owner/repo/.github/workflows/workflow.yaml@ref`
- **Triggered by another workflow**: `jobs: uses: owner/repo/.github/workflows/workflow.yaml@ref`

A reusable workflow is a normal workflow with `on: workflow_call`. Other workflows call it as a job.

Example:

1. The callee (defines the contract between caller and callee)
   **.github/workflows/build-image.yml**

```yaml
name: build-image

on:
  workflow_call:
    inputs:
      service:
        description: Service folder under services/
        type: string
        required: true
      push:
        type: boolean
        default: true
    secrets:
      REGISTRY_TOKEN:
        required: false
    outputs:
      image:
        description: Full image reference
        value: ${{ jobs.build.outputs.image }}

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      image: ${{ steps.meta.outputs.image }}
    steps:
      - uses: actions/checkout@v6
      - id: meta
        env:
          SERVICE: ${{ inputs.service }}
        run: echo "image=ghcr.io/${GITHUB_REPOSITORY,,}/${SERVICE}:${GITHUB_SHA}" >> "$GITHUB_OUTPUT"
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: services/${{ inputs.service }}
          push: ${{ inputs.push }}
          tags: ${{ steps.meta.outputs.image }}
```

** `${GITHUB_REPOSITORY,,}` lowercases the name, which GHCR requires.**

2. The caller ( trigger)
   .github/workflows/deploy.yaml

```yaml
name: ci

on:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  build-images:
    strategy:
      matrix:
        service: [api, worker]
    permissions:
      contents: read
      packages: write # the callee can't have more than the caller grants
    uses: ./.github/workflows/build-image.yml
    with:
      service: ${{ matrix.service }}

  deploy:
    needs: build-images
    uses: my-org/platform-workflows/.github/workflows/deploy.yml@v1
    with:
      environment: staging
      tag: ${{ github.sha }}
    secrets:
      KUBE_CONFIG: ${{ secrets.KUBE_CONFIG }}
```

### Composite actions: the other way to reuse code

Composite actions lets you group multiple shell commands into a single action.

A composite action bundles steps instead of jobs.

Example:

**.github/actions/build-image/action.yml**

```yaml
name: "Build and push image"
description: "Build and push a Docker image"
inputs:
  service:
    description: "Service folder under services/"
    required: true
  push:
    description: "Whether to push the image"
    type: boolean
    default: false

outputs:
  image:
    description: "The image tag"
    value: ${{ steps.meta.outputs.image }}

runs:
  using: "composite"
  steps:
    - name: Checkout
      uses: actions/checkout@v6

    - name: Login to GHCR
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push
      id: meta
      env:
        SERVICE: ${{ inputs.service }}
      run: |
        IMAGE=ghcr.io/${{ github.repository,, }}/${SERVICE}:${{ github.sha }}
        echo "image=$IMAGE" >> "$GITHUB_OUTPUT"

        docker build \
          --build-arg SERVICE=$SERVICE \
          -t "$IMAGE" .

        if [[ "${{ inputs.push }}" == "true" ]]; then
          docker push "$IMAGE"
        fi
```

**Example usage in a workflow**

```yaml
name: ci

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - run: npm ci

      - name: Build and push backend image
        uses: ./build-image
        with:
          service: backend
          push: true

      - name: Build frontend without pushing
        uses: ./build-image
        with:
          service: frontend
          push: false
```

### Example-2

**.github/actions/setup-app/action.yml**

```yaml
name: Setup app
description: Install Node and dependencies
inputs:
  node-version:
    description: Node version
    default: "22"
runs:
  using: composite
  steps:
    - uses: actions/setup-node@v6
      with:
        node-version: ${{ inputs.node-version }}
        cache: npm
    - run: npm ci
      shell: bash # required in composite steps
```

**Example usage**

```yaml
name: CI
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: ./.github/actions/setup-app # after checkout, so the file exits in the same repository
        with:
          node-version: "22"
```

**Composite actions are good for:**

- Simple, linear sequences of shell commands (checkout + setup + run).
- Actions that don’t need to spawn their own jobs.
- Actions that don’t need to run in parallel with other jobs.

**Reusable workflows are good for:**

- Composing entire jobs or stages of a workflow.
- When you want to reuse a complex sequence of jobs (like deploying to an environment).
- When you need to control permissions at the job level.

### ** Environment-based matrix**

```yaml
jobs:
  deploy:
    strategy:
      matrix:
        include:
          - { env: "dev", color: "green", hosts: "dev1 dev2" }
          - { env: "staging", color: "yellow", hosts: "staging1" }
          - { env: "prod", color: "red", hosts: "prod1 prod2 prod3" }
    runs-on: ubuntu-latest
    environment: ${{ matrix.env }}
    steps:
      - run: echo "Deploying to ${{ matrix.env }}" # green/yellow/red
      - run: echo "${{ matrix.hosts }}" # dev1 dev2 / staging1 / prod1 prod2 prod3
```

### **Job cancellation policies**

```yaml
jobs:
  fast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
      - run: npm ci
      - run: npm test

  slow:
    runs-on: ubuntu-latest
    concurrency: fast
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build
```

- **`fail-fast: false`** tells a job or matrix to keep running even if one job/configuration fails.
- **`concurrency: <name>`** groups jobs under one name; if a later job with the same name starts, the earlier one is cancelled.

### **Passing job outputs between workflows**

**File A (.github/workflows/build.yaml)**

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.set_ver.outputs.value }}
    steps:
      - id: set_ver
        run: echo "value=1.2.3" >> "$GITHUB_OUTPUT"

  upload:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - run: echo "Uploading ${{ needs.build.outputs.version }}"
```

**File B (.github/workflows/deploy.yaml)**

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: needs.build.outputs.version == '1.2.3'
    steps:
      - run: echo "Deploying 1.2.3"
    uses: other-org/repo/.github/workflows/deploy.yml@v1
    with:
      tag: ${{ needs.build.outputs.version }}
```

### **Workflow job naming**:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request' || github.base_ref == 'main'
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
      - run: npm ci
      - run: npm run lint
```

** - If it is a PR but not to main → skip**

- ** Otherwise → always run**

### **Secrets in workflows**

```yaml
jobs:
  secrets-demo:
    runs-on: ubuntu-latest
    steps:
      - run: echo "The key is ${{ secrets.MY_SECRET }}"
```

```yaml
jobs:
  secrets-demo:
    environment: production
    runs-on: ubuntu-latest
    steps:
      - run: echo "Production key: ${{ secrets.MY_SECRET }}"
```

```yaml
jobs:
  secrets-demo:
    environment: production
    runs-on: ubuntu-latest
    steps:
      - run: echo "Production key: ${{ secrets.MY_SECRET }}"
    environment:
      name: production
```

### **Permissions**:

```yaml
permissions:
  contents: read # read code only
  packages: write # push container images
  pull-requests: write # create PRs
  issues: write # create issues
  pages: write # publish GitHub Pages
```

### **Performance**:

```yaml
jobs:
  fast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: "npm"
      - run: npm ci
      - run: npm test

  slow:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: "npm"
      - run: npm ci
      - run: npm run build
```

### **Job Skipping**:

```yaml
jobs:
  test: runs
description: "Set up Docker Buildx"
inputs:
  version:
    description: "Buildx version"
    required: false
    default: "latest"
runs:
  using: "composite"
  steps:
    - name: Checkout
      uses: actions/checkout@v4
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
```

## YAML anchors and aliases:

GitHub added YAML anchor support

It was enabled automatically for all GitHub Actions users and repositories. We get basic anchors (&) and aliases (\*) within one file. Merge keys (<<:)

```yaml
name: deploy

# Variables are evaluated first, so $ENV_VAR is resolved before anchors
defaults:
  run:
    shell: bash
    env:
      ENV_VAR: foo

#ANCHORS
.on-push:
  if: github.event_name == 'push'

.on-pr:
  if: github.event_name == 'pull_request'

# ALIAS
jobs:
  build:
    runs-on: ubuntu-latest
    <<: *on-push  # This line copies the contents of .on-push here
    steps:
      - run: echo "Build"

  test:
    runs-on: ubuntu-latest
    <<: *on-pr  # This line copies the contents of .on-pr here
    steps:
      - run: echo "Test"

```

**Exmple**

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - &checkout
        uses: actions/checkout@v6
      - run: npm test
  lint:
    runs-on: ubuntu-latest
    steps:
      - *checkout
      - run: npm run lint
```

## Speed and reliability

```yaml
concurrency:
  group: ${{ github.workflow }}
  cancel-in-progress: true

timeout-minutes: 20
```

**Using concurrency and timeout together is great for:**

**preventing multiple concurrent runs**

**terminating long-running or stuck jobs**

**keeping your CI queue clean**

## Environment-based job cancellation

```yaml
name: deploy

on:
  push:
    branches: [main]

jobs:
  production:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://myapp.com
    steps:
      - run: echo "Deploying to production"
```

**Why this is good for speed and reliability:**

- **Prevents race conditions**: Production jobs run one at a time
- **Environment-specific secrets**: Only production secrets are used
- **Clear visibility**: You know exactly which job is running
- **Manual approval**: You can require manual approval before deployment

## Security essentials(DevSecOps)

1. least-privilege permissions default to read-only

```yaml
permissions:
  contents: read
jobs:
  release:
    permissions:
      contents: write
      id-token: write
```

2. Restrict token access

```yaml
name: security-scan
on:
  push:
    branches: [main]
permissions:
  contents: read
  security-events: write
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: checkout code
        uses: actions/checkout@v6
      - name: codeql scan
        uses: github/codeql-action/autobuild@v3
      - uses: github/codeql-action/analyze@v3
```

3. Never put untrusted values directly in `run` commands. PR titles, branch names, and issue text can contain shell code.

```yaml
jobs:
  bad:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - run: echo ${{ secrets.ANY }} | grep 'allowed'

  good:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - name: "grep for allowed pattern"
        run: "grep 'allowed' | grep -v '^$'"
        stdin: ${{ secrets.ANY }}
```

```yaml
# VULNERABLE
- run: echo "${{ github.event.pull_request.title }}"
# SAFE
- env:
    TITLE: ${{ github.event.pull_request.title }}
  run: echo "$TITLE"
```

**Dump a context safely for debugging:**

```yaml
jobs:
  debug-context:
    runs-on: ubuntu-latest
    steps:
      - run: "echo '${{ toJSON(github) }}' > context.json"
      - uses: actions/upload-artifact@v6
        with:
          name: context-dump
          path: context.json
```

4. Pin third-party actions to a full commit SHA, with the version in a comment, and let Dependabot update them:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      # Dependabot will update the SHA
      - uses: actions/setup-node@v6 # v6.0.2
      - uses: some-org/some-action@8f4b7f84864484a7bf31766abe9204da3cbe65b3 # v3.5.0
        with:
          node-version: 22
          cache: "npm"
      - run: npm ci
      - run: npm test
```

5. Prefer OIDC over long-lived cloud keys (no stored secret at all):

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write # required for OIDC
      contents: write
    steps:
      - name: checkout
        uses: actions/checkout@v6

      - name: Configure AWS credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::111122223333:role/GitHubOIDC
          aws-region: us-east-1

      - name: Deploy to S3
        run: aws s3 cp build/ s3://my-bucket --recursive
```

**OR**

**The cloud role trusts repo and branch. Short-lived credentials, nothing to leak.**

```yaml
permissions:
  id-token: write
  contents: read
steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/gha-deploy
      aws-region: eu-west-1
```

6. **Secrets hygiene**

- **Pass secrets only to the step that needs them (env: on that step)**

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: echo "$MY_SECRET" # available here
        env:
          MY_SECRET: ${{ secrets.MY_SECRET }}
      - run: echo "Not here" # not available here
```

- **Secrets are masked in logs, but transformed values (base64, substrings) may not be**

```yaml
- run: echo "${{ secrets.MY_SECRET }}" # masked
- run: echo "${{ base64encode(secrets.MY_SECRET) }}" # not masked (transformed)
- run: echo "${{ secrets.MY_SECRET }}" | cut -c1-5 # not masked (substring)
```

- **Not available to workflows triggered by forks (this is good)**

```yaml
name: build

on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Regular build"

  dependabot:
    if: github.event_name == 'pull_request' && github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Build from Dependabot PR"
```

- **Put production secrets in an environment with required reviewers**

```yaml
jobs:
  prod-deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://myapp.com
    steps:
      - run: echo "Deploying to production"
```

- **Encrypted-in-git options from Topic 18 still apply**

### **Tip from Topic 17: Prefer smaller, single-purpose actions**

```yaml
# Good
- uses: docker/setup-buildx-action@v3
- uses: actions/checkout@v6
- uses: actions/setup-node@v6

# Less good
- uses: some-org/docker-build-deploy-notify-action@v1
```

### **Tip from Topic 3: Use composite actions for reusability (and version them)**

```yaml
name: "Node.js CI"

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: "npm"
      - run: npm ci
      - run: npm test
```

### ** Tip from Topic 13: Use `cache` on `setup-node` for faster installs**

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: "npm"
      - run: npm ci
      - run: npm test
```

### **Tip from Topic 10: Use environments for promotion gates (staging → prod)**

```yaml
jobs:
  staging-deploy:
    runs-on: ubuntu-latest
    environment:
      name: staging
    steps:
      - run: echo "Deploying to staging"

  prod-deploy:
    needs: staging-deploy
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://myapp.com
    steps:
      - run: echo "Deploying to production"
```

7. **Tip: `Pull_request_target` is dangerous. It runs with secrets and a write token in the base repo's context. Never check out and run the PR's code there.**

8. **Self-hosted runners on public repos let strangers run code on your machines. Avoid.**

9. **Scan in the pipeline**

```yaml
Tool / action                         | Finds
----------------------------------------------------------------
github/codeql-action (init, analyze)  | Code vulnerabilities (SAST)
actions/dependency-review-action      | Risky dependency changes in PRs
aquasecurity/trivy-action             | Container image and IaC issues
gitleaks/gitleaks-action              | Committed secrets
actionlint, zizmor                    | Mistakes and security problems in the workflows themselves
```

## Best practices for YAML

1. **Indent with spaces, not tabs.** (2 or 4 spaces are common.)
2. **Keep structure shallow** (avoid deeply nested structures).
3. **Use `|` or `>` for multi-line strings** (more readable than `\n`).
4. **Quote scalars that could be ambiguous** (e.g., `'true'`, `'null'`, `'123'`).
5. **Group related items** (e.g., `name`, `on`, `jobs` at the top level).
6. **Reuse logic with composite actions** (see Tip #3 above).
7. **Pin action versions** with `uses: action/name@sha` (security and stability).
8. **Prefer environments for promotion gates** (staging → prod).
9. **Scan the pipeline for security issues.**

---

**End of "Comprehensive Guide to GitHub Actions"**

## ✅ Do this

| Area            | Recommendation                                                  |
| --------------- | --------------------------------------------------------------- |
| Security        | Pin actions to commit SHAs; use OIDC; least privilege.          |
| Speed           | Use `cache` on `setup-node`; keep jobs small and focused.       |
| Reliability     | Use environments for promotion gates; test workflows locally.   |
| Maintainability | Use composite actions for reuse; keep YAML shallow and clear.   |
| Scanning        | Integrate CodeQL, Trivy, and dependency review early and often. |

## ❌ Don't do this

| Area            | Anti-pattern                                                                            |
| --------------- | --------------------------------------------------------------------------------------- |
| Security        | Use `pull_request_target`; store cloud keys as secrets; run untrusted PR code directly. |
| Speed           | No caching; monolithic jobs that do everything.                                         |
| Reliability     | No environment gates between staging and production.                                    |
| Maintainability | Deeply nested YAML; no reusable composite actions; no version pins.                     |
| Scanning        | No security scanning in the pipeline.                                                   |
