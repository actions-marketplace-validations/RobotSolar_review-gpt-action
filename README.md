# Review GPT Action

ChatGPT 와 함께하는 코드리뷰 💬

## Github Actions 사용
1. `OPEN_API_KEY` 시크릿 등록
2. `.github/workflows/[파일명].yml` 워크플로우 등록

```yml
name: Code Review
on:
  pull_request:
    types:
      - opened

jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: hyeongyuan/review-gpt-action@v0.1.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

```
