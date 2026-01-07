# Note Editor Component

A feature-rich markdown editor component with live preview, autosave, and syntax highlighting for the Personal Knowledge OS.

## Features

### ✅ **Live Preview**
- Real-time markdown rendering as you type
- Split-view and full-screen modes
- Clean, readable typography

### ✅ **Autosave**
- Automatic saving after 2 seconds of inactivity
- Visual indicators for save status
- Manual save option available

### ✅ **Code Block Support**
- Syntax highlighting for 100+ languages
- Theme-aware (dark/light mode)
- Inline code formatting

### ✅ **Clean UI**
- Minimalist design that doesn't distract
- Responsive layout
- Keyboard shortcuts support

## Usage

### Basic Usage

```tsx
import { NoteEditor } from '@/components/note-editor';

function MyPage() {
  return (
    <NoteEditor
      initialContent="# Hello World\n\nStart writing..."
      onSave={(note) => console.log('Note saved:', note)}
    />
  );
}
```

### Editing Existing Notes

```tsx
function EditNote({ noteId }: { noteId: string }) {
  return (
    <NoteEditor
      noteId={noteId}
      onSave={(note) => {
        // Handle note updates
        console.log('Note updated:', note);
      }}
    />
  );
}
```

## Component API

### NoteEditor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `noteId` | `string` | `undefined` | ID of existing note to edit |
| `initialContent` | `string` | `''` | Initial markdown content |
| `onSave` | `(note: Note) => void` | `undefined` | Callback when note is saved |
| `className` | `string` | `undefined` | Additional CSS classes |

## View Modes

### **Edit Mode**
- Full-screen markdown editor
- Tab key for indentation
- Auto-resizing textarea

### **Preview Mode**
- Full-screen rendered markdown
- All styling and syntax highlighting

### **Split Mode** (Default)
- Side-by-side editor and preview
- Perfect for writing and reviewing

## Markdown Features

### Supported Syntax

- **Headers**: `# ## ###`
- **Text Formatting**: `*italic*`, `**bold**`, `~~strikethrough~~`
- **Lists**: `- item`, `1. item`
- **Links**: `[text](url)`
- **Images**: `![alt](url)`
- **Blockquotes**: `> quote`
- **Code**: \`inline\`, \`\`\`blocks\`\`\`
- **Tables**: Markdown table syntax
- **Horizontal Rules**: `---`

### Code Block Languages

Supports syntax highlighting for:
- JavaScript/TypeScript
- Python
- Java
- C/C++
- Go
- Rust
- PHP
- Ruby
- And 100+ more languages

```typescript
// Example code block
function greet(name: string) {
  return `Hello, ${name}!`;
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Indent line |
| `Ctrl/Cmd + S` | Manual save (when implemented) |

## Autosave Behavior

- **Trigger**: 2 seconds after last keystroke
- **Visual Feedback**: "Unsaved changes" indicator
- **Save Status**: Shows last saved timestamp
- **Error Handling**: Graceful failure with user notification

## Storage Integration

The editor automatically integrates with the storage layer:

- **New Notes**: Creates new note with auto-generated title
- **Existing Notes**: Loads and updates existing notes
- **Title Extraction**: Uses first heading or first line as title
- **Metadata**: Tracks creation and update timestamps

## Styling

### Theme Support
- Automatic dark/light mode detection
- Syntax highlighting adapts to theme
- Consistent with app design system

### Responsive Design
- Mobile-friendly layout
- Touch-friendly controls
- Optimized for various screen sizes

## Performance

### Optimizations
- Debounced autosave prevents excessive saves
- Efficient markdown rendering
- Lazy-loaded syntax highlighting
- Minimal re-renders

### Bundle Size
- Tree-shakable imports
- Only loads required languages for syntax highlighting

## Future Enhancements

- **Toolbar**: Rich text editing buttons
- **Keyboard Shortcuts**: More markdown shortcuts
- **Find & Replace**: Text search functionality
- **Version History**: Note revision tracking
- **Collaborative Editing**: Real-time collaboration
- **File Attachments**: Image and file uploads

## Dependencies

- `react-markdown`: Markdown rendering
- `react-syntax-highlighter`: Code syntax highlighting
- `@/lib/storage`: Note persistence
- `@/components/ui`: UI components