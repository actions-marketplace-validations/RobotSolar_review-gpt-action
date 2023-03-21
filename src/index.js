const { run } = require('@probot/adapter-github-actions');
const { Chat } = require('./chat');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

run((app) => {
  app.on('pull_request.opened', async (context) => {
    if (!OPENAI_API_KEY) {
      return 'OPENAI_API_KEY is not set';
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

      app.log(file);

      if (['modified', 'added'].indexOf(file.status) === -1) {
        continue;
      }
      if (!patch) {
        continue;
      }

      const res = await chat.codeReview(patch);
      app.log(res);

      await context.octokit.pulls.createReviewComment({
        repo: repo.repo,
        owner: repo.owner,
        pull_number: context.pullRequest().pull_number,
        commit_id: commits[commits.length - 1].sha,
        path: file.filename,
        body: res.text,
        position: patch.split('\n').length - 1,
      });
    }
    return;
    // return context.octokit.issues.createComment(
    //   context.issue({ body: 'Hello, World!' })
    // );
  });
});
