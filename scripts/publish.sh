#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if logged into npm
if ! npm whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged into npm. Please run: npm login${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Logged into npm as: $(npm whoami)${NC}\n"

# Check if packages are built
if [ ! -d "packages/core/dist" ] || [ ! -d "packages/cli/dist" ]; then
    echo -e "${YELLOW}📦 Building packages...${NC}"
    pnpm run build
    echo -e "${GREEN}✓ Build complete${NC}\n"
else
    echo -e "${GREEN}✓ Packages already built${NC}\n"
fi

# Function to publish a package
publish_package() {
    local package_dir=$1
    local package_name=$2
    
    echo -e "${YELLOW}📤 Publishing ${package_name}...${NC}"
    cd "$package_dir"
    
    # Replace workspace:* dependencies with actual versions before publishing
    # npm doesn't understand workspace: protocol, so we need to replace it
    local restore_needed=false
    if [ "$package_dir" = "packages/cli" ]; then
        node -e "
            const fs = require('fs');
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            if (pkg.devDependencies && pkg.devDependencies['@next-md-blog/core'] === 'workspace:*') {
                const corePkg = JSON.parse(fs.readFileSync('../core/package.json', 'utf8'));
                pkg.devDependencies['@next-md-blog/core'] = '^' + corePkg.version;
                fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
                console.log('Updated @next-md-blog/core dependency to ^' + corePkg.version);
            }
        "
        restore_needed=true
    fi
    
    npm publish --access public
    
    # Restore workspace:* if we changed it
    if [ "$restore_needed" = true ]; then
        node -e "
            const fs = require('fs');
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            if (pkg.devDependencies && pkg.devDependencies['@next-md-blog/core']) {
                pkg.devDependencies['@next-md-blog/core'] = 'workspace:*';
                fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
            }
        "
    fi
    
    echo -e "${GREEN}✓ ${package_name} published successfully${NC}\n"
    cd - > /dev/null
}

# Publish core first (since CLI depends on it)
echo -e "${YELLOW}📦 Publishing @next-md-blog/core...${NC}"
publish_package "packages/core" "@next-md-blog/core"

# Publish CLI
echo -e "${YELLOW}📦 Publishing @next-md-blog/cli...${NC}"
publish_package "packages/cli" "@next-md-blog/cli"

echo -e "${GREEN}✅ All packages published successfully!${NC}"
echo -e "\n${GREEN}Verify at:${NC}"
echo -e "  - https://www.npmjs.com/package/@next-md-blog/core"
echo -e "  - https://www.npmjs.com/package/@next-md-blog/cli"

