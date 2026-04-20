import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import * as preferArrow from 'eslint-plugin-prefer-arrow';
import prettierPlugin from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
	// global ignores — put this first
	globalIgnores([
		'.react-router/', // ignore that folder
		'.react-router/**', // ignore everything inside
		'node_modules/',
		'dist/',
		'build/'
	]),
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		plugins: {
			js,
			prettier: prettierPlugin,
			'prefer-arrow': preferArrow,
			'simple-import-sort': simpleImportSort
		},
		rules: {
			'prettier/prettier': [
				'error',
				{
					trailingComma: 'none'
				}
			],
			'comma-dangle': 'off',
			'prefer-arrow/prefer-arrow-functions': [
				'error',
				{
					disallowPrototype: true,
					singleReturnOnly: false,
					classPropertiesAllowed: false
				}
			],
			'simple-import-sort/imports': 'warn',
			'simple-import-sort/exports': 'warn'
		},
		languageOptions: { globals: globals.browser }
	},
	tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	// Override: detect React version and disable the now-obsolete rule
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		settings: { react: { version: 'detect' } },
		rules: {
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off'
		}
	}
]);
