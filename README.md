# Review GPT Action

ChatGPT for code review 💬

## Github Actions Usage
1. `OPEN_API_KEY` API KEY [OpenAI API KEY](https://platform.openai.com/account/api-keys)
2. `.github/workflows/[your-workflow].yml` github actions workflow

```yml
name: Code Review
on:
  pull_request:
    types:
      - opened
env:
  lang: english

jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: RobotSolar/review-gpt-action@v0.1.1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          LANG: ${{ env.lang }}

```
