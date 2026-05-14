import fs from 'node:fs';
import path from 'node:path';
import tseslint from 'typescript-eslint';

const rootDirectory = import.meta.dirname;
const tsconfig = JSON.parse(fs.readFileSync(path.join(rootDirectory, 'tsconfig.json'), 'utf8'));
const pathAliases = Object.entries(tsconfig.compilerOptions.paths ?? {})
  .map(([aliasPattern, targets]) => {
    const targetPattern = targets?.[0];

    if (!targetPattern?.endsWith('/*') || !aliasPattern.endsWith('/*')) {
      return null;
    }

    return {
      aliasPrefix: aliasPattern.slice(0, -1),
      absoluteTargetPrefix: path.resolve(rootDirectory, targetPattern.slice(0, -1)),
    };
  })
  .filter(Boolean)
  .sort((left, right) => right.absoluteTargetPrefix.length - left.absoluteTargetPrefix.length);

const toPosixPath = (value) => value.split(path.sep).join('/');

const getAliasImportPath = (filename, importPath) => {
  if (!importPath.startsWith('.')) {
    return null;
  }

  const absoluteImportPath = path.resolve(path.dirname(filename), importPath);
  const matchingAlias = pathAliases.find(({ absoluteTargetPrefix }) => {
    return absoluteImportPath === absoluteTargetPrefix.slice(0, -1)
      || absoluteImportPath.startsWith(absoluteTargetPrefix);
  });

  if (!matchingAlias) {
    return null;
  }

  const suffix = toPosixPath(path.relative(matchingAlias.absoluteTargetPrefix, absoluteImportPath));

  if (suffix.startsWith('..')) {
    return null;
  }

  const aliasImportPath = `${matchingAlias.aliasPrefix}${suffix}`;
  return aliasImportPath.length < importPath.length ? aliasImportPath : null;
};

const preferPathAliasesRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer configured TypeScript path aliases when they shorten imports.',
    },
    fixable: 'code',
    messages: {
      preferAlias: 'Import can be shortened to "{{ aliasPath }}".',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const filename = context.filename;

    const checkSource = (node) => {
      if (!node.source || typeof node.source.value !== 'string') {
        return;
      }

      const aliasPath = getAliasImportPath(filename, node.source.value);

      if (!aliasPath) {
        return;
      }

      context.report({
        node: node.source,
        messageId: 'preferAlias',
        data: { aliasPath },
        fix(fixer) {
          const rawSource = sourceCode.getText(node.source);
          const quote = rawSource[0] === '"' ? '"' : "'";

          return fixer.replaceText(node.source, `${quote}${aliasPath}${quote}`);
        },
      });
    };

    return {
      ExportAllDeclaration: checkSource,
      ExportNamedDeclaration: checkSource,
      ImportDeclaration: checkSource,
    };
  },
};

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.{js,jsx,ts,tsx}', 'vite.config.ts'],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      project: {
        rules: {
          'prefer-path-aliases': preferPathAliasesRule,
        },
      },
    },
    rules: {
      'project/prefer-path-aliases': 'warn',
    },
  },
];
