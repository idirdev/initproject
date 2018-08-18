# initproject

> **[EN]** Scaffold new projects from built-in templates.
> **[FR]** Creer de nouveaux projets a partir de templates integres.

---

## Features / Fonctionnalites

**[EN]**
- 4 built-in templates: node, express, cli, library
- Complete project structure with src/, tests/, README
- Package.json auto-generation with correct metadata
- Git initialization option
- npm package name validation
- Custom template registration
- Clean, production-ready boilerplate

**[FR]**
- 4 templates integres : node, express, cli, library
- Structure de projet complete avec src/, tests/, README
- Generation automatique de package.json avec metadonnees
- Option d'initialisation Git
- Validation du nom de package npm
- Enregistrement de templates personnalises
- Boilerplate propre, pret pour la production

---

## Installation

```bash
npm install -g @idirdev/initproject
```

---

## Templates disponibles / Available Templates

| Template | Description EN | Description FR |
|----------|---------------|----------------|
| `node` | Minimal Node.js package with src/ and tests/ | Package Node.js minimal avec src/ et tests/ |
| `express` | Express server with routes/ and middleware/ | Serveur Express avec routes/ et middleware/ |
| `cli` | CLI tool with bin/ and argument parsing | Outil CLI avec bin/ et parsing d'arguments |
| `library` | Reusable library with named exports | Librairie reutilisable avec exports nommes |

---

## CLI Usage / Utilisation CLI

```bash
# Create a new Node.js project
initproject my-app

# Use a specific template
initproject my-api --template express

# Create a CLI tool
initproject my-cli --template cli

# Specify output directory
initproject my-lib --template library --dir ./packages

# Initialize git repo
initproject my-app --git

# List available templates
initproject --list
```

### Example Output / Exemple de sortie

```
$ initproject my-api --template express --git

Creating project: my-api (template: express)
  Created: my-api/package.json
  Created: my-api/src/server.js
  Created: my-api/src/routes/index.js
  Created: my-api/src/middleware/logger.js
  Created: my-api/tests/server.test.js
  Created: my-api/README.md
  Created: my-api/.gitignore
  Initialized git repository

Project my-api created successfully!
```

---

## API (Programmatic) / API (Programmation)

```js
const { scaffold, listTemplates, addTemplate, validateName, TEMPLATES } = require('initproject');

// Scaffold a new project
scaffold('my-app', 'express', './projects');

// List available templates
const templates = listTemplates();
// => [{ name: 'node', description: '...' }, ...]

// Validate package name
validateName('my-app');    // => true
validateName('My App!!');  // => false

// Register custom template
addTemplate('react', {
  description: 'React SPA starter',
  files: { 'src/App.js': '...', 'public/index.html': '...' }
});
```

---

## License

MIT - idirdev
