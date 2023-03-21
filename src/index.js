const { run } = require('@probot/adapter-github-actions');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const getVariables = async (context, name) => {
  const repo = context.repo();
  const { data } = await context.octokit.request('GET /repos/{owner}/{repo}/actions/variables/{name}', {
    owner: repo.owner,
    repo: repo.repo,
    name,
  });
  return data;
};

run((app) => {
  app.on('pull_request.opened', async (context) => {
    const repo = context.repo();

    if (OPENAI_API_KEY) {
      app.log(OPENAI_API_KEY);
      app.log('OPENAI_API_KEY is set');
    }
    const vars = await getVariables(context, 'OPENAI_API_KEY');

    app.log(vars);

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

      app.log({
        repo: repo.repo,
        owner: repo.owner,
        pull_number: context.pullRequest().pull_number,
        commit_id: commits[commits.length - 1].sha,
        path: file.filename,
        body: 'hello world',
        position: patch.split('\n').length - 1,
      });

      await context.octokit.pulls.createReviewComment({
        repo: repo.repo,
        owner: repo.owner,
        pull_number: context.pullRequest().pull_number,
        commit_id: commits[commits.length - 1].sha,
        path: file.filename,
        body: 'hello world',
        position: patch.split('\n').length - 1,
      });
    }
    return;
    // return context.octokit.issues.createComment(
    //   context.issue({ body: 'Hello, World!' })
    // );
  });
});
