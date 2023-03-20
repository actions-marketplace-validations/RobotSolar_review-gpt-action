const { run } = require('@probot/adapter-github-actions');

run((app) => {
  app.on('pull_request.opened', async (context) => {
    const repo = context.repo();

    const pullRequest = context.payload.pull_request;

    if (
      pull_request.state === 'closed' ||
      pull_request.locked ||
      pull_request.draft
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
      app.log(changedFiles[i]);
    }
    return;
    // return context.octokit.issues.createComment(
    //   context.issue({ body: 'Hello, World!' })
    // );
  });
});
