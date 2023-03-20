const { run } = require('@probot/adapter-github-actions');

run((app) => {
  app.log('Yay! The app was loaded!');

  app.on('issues.opened', async (context) => {
    return context.octokit.issues.createComment(
      context.issue({ body: 'Hello, World!' })
    );
  });
});
