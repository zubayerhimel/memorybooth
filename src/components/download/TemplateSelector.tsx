import { TemplateTheme, TemplateConfig } from '@/types/photobooth';
import { TEMPLATES } from '@/constants/templates';

interface TemplateSelectorProps {
  selectedTemplate: TemplateTheme;
  templateConfig: TemplateConfig;
  customHeaderText: string;
  customFooterText: string;
  onTemplateChange: (template: TemplateTheme) => void;
  onHeaderTextChange: (text: string) => void;
  onFooterTextChange: (text: string) => void;
  onResetText: () => void;
}

const HEADER_MAX_CHARS = 30;
const FOOTER_MAX_CHARS = 25;

export const TemplateSelector = ({
  selectedTemplate,
  templateConfig,
  customHeaderText,
  customFooterText,
  onTemplateChange,
  onHeaderTextChange,
  onFooterTextChange,
  onResetText,
}: TemplateSelectorProps) => {
  return (
    <div className="space-y-4">
      {/* Theme Selection */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Choose Theme</label>
        <div className="grid grid-cols-4 gap-1.5">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => onTemplateChange(template.id)}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all ${
                selectedTemplate === template.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <span className="text-lg">{template.emoji}</span>
              <span className="text-[10px] font-medium">{template.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Text */}
      <div className="space-y-3 pt-2 border-t border-border">
        <label className="text-xs font-medium text-muted-foreground block">Custom Text</label>
        <input
          type="text"
          value={customHeaderText}
          onChange={(e) => onHeaderTextChange(e.target.value.slice(0, HEADER_MAX_CHARS))}
          placeholder={selectedTemplate !== 'none' ? templateConfig.headerText : 'Header text...'}
          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          maxLength={HEADER_MAX_CHARS}
        />
        <input
          type="text"
          value={customFooterText}
          onChange={(e) => onFooterTextChange(e.target.value.slice(0, FOOTER_MAX_CHARS))}
          placeholder="Footer text..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          maxLength={FOOTER_MAX_CHARS}
        />
        {(customHeaderText || customFooterText) && (
          <button
            onClick={onResetText}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ↩ Reset text
          </button>
        )}
      </div>

      {selectedTemplate !== 'none' && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 text-sm">
          <span>{templateConfig.emoji}</span>
          <span className="font-medium">{templateConfig.name} active</span>
        </div>
      )}
    </div>
  );
};
