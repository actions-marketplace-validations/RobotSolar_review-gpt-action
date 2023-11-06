const { run } = require('@probot/adapter-github-actions');
const { Chat } = require('./chat');

const MAX_PATCH_COUNT = 4000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

run((app) => {
  app.on('pull_request.opened', async (context) => {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const chat = new Chat(OPENAI_API_KEY);
    const repo = context.repo();
    
    const pullRequest = context.payload.pull_request;

    if (
      pullRequest.state === 'closed' ||
      pullRequest.locked ||
      pullRequest.draft
    ) {
      return 'invalid event payload';
    }

    const { data } = await context.octokit.repos.compareCommits({
      owner: repo.owner,
      repo: repo.repo,
      base: pullRequest.base.sha,
      head: pullRequest.head.sha,
    });

    const { files: changedFiles, commits } = data;

    if (!changedFiles?.length) {
      return 'no change';
    }

    for (let i = 0; i < changedFiles.length; i++) {
      const file = changedFiles[i];
      const patch = file.patch || '';

      if (['modified', 'added'].indexOf(file.status) === -1) {
        app.log(`skip file "${file.filename}" (status: "${file.status}" / size: ${patch.length})`);
        continue;
      }
      const filename = file.filename.split('/').pop();
      if (filename && ['package-lock.json', 'yarn.lock'].indexOf(filename) !== -1) {
        app.log(`skip file "${file.filename}" (status: "${file.status}" / size: ${patch.length})`);
        continue;
      }
      if (!patch || patch.length > MAX_PATCH_COUNT) {
        app.log(`skip file "${file.filename}" (status: "${file.status}" / size: ${patch.length})`);
        continue;
      }
      const ext = file.filename.split('.').pop();
      const res = await chat.codeReview(patch, ext);

      await context.octokit.pulls.createReviewComment({
        repo: repo.repo,
        owner: repo.owner,
        pull_number: context.pullRequest().pull_number,
        commit_id: commits[commits.length - 1].sha,
        path: file.filename,
        body: res.message.content,
        position: patch.split('\n').length - 1,
      });
    }
    return 'success';
  });
});
