module.exports = {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { breaking: true, release: 'major' },
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'deps', release: false },
          { type: 'docs', release: false },
          { type: 'refactor', release: false },
          { type: 'style', release: false },
          { type: 'chore', release: false },
          { type: 'ci', release: false },
        ],
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: '🚀 New Features' },
            { type: 'fix', section: '🐞 Bug Fixes' },
            { type: 'deps', section: '📦 Dependency Updates' },
            { type: 'docs', section: '📖 Documentation' },
            { type: 'refactor', section: '🛠️ Refactoring' },
            { type: 'style', section: '🎨 Code Style Improvements' },
            { type: 'chore', section: '🔧 Chores' },
            { type: 'ci', section: '🔄 Continuous Integration' },
          ],
        },
        writerOpts: {
          headerPartial: '## {{version}} - {{date}}',
          groupBy: 'type',
          commitGroupsSort: (a, b) => {
            const order = [
              '🚀 New Features',
              '🐞 Bug Fixes',
              '📦 Dependency Updates',
              '📖 Documentation',
              '🛠️ Refactoring',
              '🎨 Code Style Improvements',
              '🔧 Chores',
              '🔄 Continuous Integration',
            ];
            return order.indexOf(a.title) - order.indexOf(b.title);
          },
          commitsSort: ['scope', 'subject'],
        },
        linkCompare: true,
        linkReferences: true,
      },
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle: '# Changelog',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd:
          'jq --arg v "${nextRelease.version}" \'.version = $v\' .claude-plugin/plugin.json > .claude-plugin/plugin.json.tmp && mv .claude-plugin/plugin.json.tmp .claude-plugin/plugin.json',
      },
    ],
    [
      '@semantic-release/github',
      {
        successComment:
          ":tada: This ${issue.pull_request ? 'pull request' : 'issue'} has been included in version ${nextRelease.version} :tada:\n\nThe release is available on [GitHub release](${releases[0].url}).",
        failComment:
          "The release from branch ${branch.name} failed due to the following issues:\n\n${errors.map(e => `- ${e.message}`).join('\\n')}",
        failTitle: 'The automated release failed 🚨',
        releasedLabels: [
          "released<%= nextRelease.channel ? ` on @${nextRelease.channel}` : '' %>",
        ],
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'package.json',
          'package-lock.json',
          'CHANGELOG.md',
          '.claude-plugin/plugin.json',
        ],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};
