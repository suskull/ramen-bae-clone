# Use pnpm Package Manager

## Always Use pnpm Instead of npm

For this project, **ALWAYS** use `pnpm` as the package manager instead of `npm` or `yarn`.

## Commands to Use

### Installation
- **Use**: `pnpm install` or `pnpm i`
- **Don't use**: `npm install` or `yarn install`

### Adding Dependencies
- **Use**: `pnpm add <package>`
- **Don't use**: `npm install <package>` or `yarn add <package>`

### Adding Dev Dependencies
- **Use**: `pnpm add -D <package>`
- **Don't use**: `npm install --save-dev <package>` or `yarn add -D <package>`

### Running Scripts
- **Use**: `pnpm dev`, `pnpm build`, `pnpm start`
- **Don't use**: `npm run dev`, `yarn dev`

### Removing Packages
- **Use**: `pnpm remove <package>`
- **Don't use**: `npm uninstall <package>` or `yarn remove <package>`

### Executing Binaries
- **Use**: `pnpm exec <command>` or `pnpm dlx <package>`
- **Don't use**: `npx <command>`

## Why pnpm?

1. **Faster**: More efficient installation and disk space usage
2. **Strict**: Better dependency resolution and no phantom dependencies
3. **Efficient**: Uses hard links and content-addressable storage
4. **Compatible**: Works with all npm packages

## This Rule Applies To

- All package installation commands
- All dependency management operations
- All script execution commands
- Documentation and instructions
- Setup guides and README files

**Remember**: Always use `pnpm` for any package management operations in this project!
