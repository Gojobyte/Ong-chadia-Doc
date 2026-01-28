import { useState, useEffect, useCallback } from 'react';
import { Settings2, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useDocumentMetadata,
  useMetadataTemplates,
  useSetDocumentMetadata,
  useUpdateDocumentMetadata,
  useRemoveDocumentMetadata,
} from '@/hooks/useMetadata';
import type { MetadataField } from '@/services/metadata.service';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface MetadataEditorProps {
  documentId: string;
  folderId?: string;
}

export function MetadataEditor({ documentId }: MetadataEditorProps) {
  const { data: metadata, isLoading: metadataLoading } = useDocumentMetadata(documentId);
  const { data: templates = [], isLoading: templatesLoading } = useMetadataTemplates();
  const setMetadataMutation = useSetDocumentMetadata();
  const updateMetadataMutation = useUpdateDocumentMetadata();
  const removeMetadataMutation = useRemoveDocumentMetadata();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Debounced values for auto-save
  const debouncedValues = useDebounce(values, 1000);

  // Initialize from existing metadata
  useEffect(() => {
    if (metadata) {
      setSelectedTemplateId(metadata.templateId);
      setValues(metadata.values);
    } else {
      setSelectedTemplateId(null);
      setValues({});
    }
    setIsDirty(false);
  }, [metadata]);

  // Auto-save when values change (debounced)
  useEffect(() => {
    if (isDirty && metadata && selectedTemplateId) {
      updateMetadataMutation.mutate({
        documentId,
        values: debouncedValues,
      });
      setIsDirty(false);
    }
  }, [debouncedValues, isDirty, metadata, documentId, selectedTemplateId, updateMetadataMutation]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const handleTemplateSelect = useCallback(
    (templateId: string) => {
      setSelectedTemplateId(templateId);
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        // Initialize values with defaults
        const initialValues: Record<string, unknown> = {};
        template.fields.forEach((field) => {
          initialValues[field.key] = '';
        });
        setValues(initialValues);
      }
    },
    [templates]
  );

  const handleSaveMetadata = () => {
    if (!selectedTemplateId) return;

    setMetadataMutation.mutate({
      documentId,
      templateId: selectedTemplateId,
      values,
    });
  };

  const handleRemoveMetadata = () => {
    if (!metadata) return;
    removeMetadataMutation.mutate(documentId);
  };

  const handleFieldChange = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const renderField = (field: MetadataField) => {
    const value = values[field.key] ?? '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value as string}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.label}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value as string}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.label}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value as string}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
          />
        );

      case 'select':
        return (
          <Select
            value={value as string}
            onValueChange={(v) => handleFieldChange(field.key, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Sélectionner ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  const isLoading = metadataLoading || templatesLoading;
  const isSaving = setMetadataMutation.isPending || updateMetadataMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  // No templates available
  if (templates.length === 0) {
    return (
      <div className="text-sm text-slate-500 py-2">
        Aucun template de métadonnées disponible.
      </div>
    );
  }

  // No metadata set yet - show template selector
  if (!metadata) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-500">
          Ajouter des métadonnées personnalisées à ce document.
        </p>

        <Select value={selectedTemplateId || ''} onValueChange={handleTemplateSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedTemplate && (
          <>
            <div className="space-y-3 pt-2">
              {selectedTemplate.fields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label className={cn(field.required && 'after:content-["*"] after:ml-0.5 after:text-red-500')}>
                    {field.label}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>

            <Button
              onClick={handleSaveMetadata}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Ajouter les métadonnées
            </Button>
          </>
        )}
      </div>
    );
  }

  // Metadata exists - show editor
  return (
    <div className="space-y-3">
      {/* Template info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Settings2 className="w-4 h-4" />
          <span>Template: {metadata.template.name}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
          onClick={handleRemoveMetadata}
          disabled={removeMetadataMutation.isPending}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {metadata.template.fields.map((field) => (
          <div key={field.key} className="space-y-1">
            <Label
              className={cn(
                'text-xs',
                field.required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
              )}
            >
              {field.label}
            </Label>
            {renderField(field)}
          </div>
        ))}
      </div>

      {/* Auto-save indicator */}
      {(isDirty || isSaving) && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              Modifications non enregistrées
            </>
          )}
        </div>
      )}
    </div>
  );
}
