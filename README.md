# Reword Chrome Extension

A Chrome extension that adds a floating AI-powered rewording button to text inputs and textareas, helping you rephrase text using OpenAI's API via OpenRouter.

## Features

- **Smart Element Detection**: Works with standard inputs, textareas, contentEditable elements, and akEditor (Jira/Confluence)
- **Consistent Positioning**: Button always appears at the bottom-right corner with configurable offsets
- **Domain-Specific Overrides**: Set different offset values for specific websites
- **akEditor Support**: Seamless integration with Atlassian akEditor components
- **Hover/Focus Modes**: Show button on hover or focus events
- **Auto-hide**: Configurable auto-hide behavior with custom delays
- **AI Integration**: Powered by OpenRouter API with customizable prompts

## Installation

1. Clone this repository
2. Run `bun install` to install dependencies
3. Run `bun run build` to build the extension
4. Load the `dist` folder in Chrome as an unpacked extension

## Configuration

### Basic Settings

Configure the extension behavior in the options page:

- **Position Offsets**: Fine-tune horizontal and vertical positioning with pixel offsets (button always appears at bottom-right)
- **Button Size**: Adjust the size of the floating button (24-48px)
- **Behavior**: Configure hover mode, auto-hide, and hide delays
- **AI Settings**: Set your OpenRouter API key and customize the rewording prompt

### Domain-Specific Overrides

For websites with unique layouts (like Jira/Confluence with akEditor), you can set domain-specific offset adjustments:

1. Open the extension options
2. Navigate to "Domain-Specific Overrides"
3. Add a domain (e.g., `your-company.atlassian.net`)
4. Configure custom offset values for that domain
5. Save settings

**Common akEditor domains to override:**
- `*.atlassian.net` (Jira/Confluence Cloud)
- `*.jira.com`
- `your-company.atlassian.net`

### akEditor Support

The extension automatically detects akEditor elements using the selector `.akEditor .ak-editor-content-area` and positions the button at the bottom-right corner. You can fine-tune the positioning using domain-specific offset settings.

**Supported akEditor features:**
- Text selection and replacement
- Full content replacement when no text is selected
- Proper event triggering for akEditor's change detection

## Usage

1. **Focus or hover** over any text input, textarea, or akEditor element
2. **Click the floating button** that appears
3. **Select text** to rephrase (or leave unselected to rephrase all content)
4. The AI will rephrase your text and replace it automatically

## Development

```bash
# Install dependencies
bun install

# Development mode with auto-reload
bun run dev

# Build for production
bun run build

# Type checking
bun run type-check
```

## Supported Elements

- `<input type="text">` and other text input types
- `<textarea>` elements  
- Elements with `contentEditable="true"`
- akEditor components (`.akEditor .ak-editor-content-area`)

## API Configuration

Get your OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys) and configure it in the extension options.

The extension uses the `deepseek/deepseek-chat-v3-0324:free` model by default, but this can be configured in the code.

## License

MIT License
