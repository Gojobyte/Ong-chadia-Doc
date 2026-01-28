import type { Request, Response } from 'express';
import * as metadataService from './metadata.service.js';
import type { MetadataField } from './metadata.service.js';

// GET /api/metadata-templates
export async function getTemplates(req: Request, res: Response) {
  try {
    const folderId = req.query.folderId as string | undefined;

    let templates;
    if (folderId) {
      templates = await metadataService.getTemplatesForFolder(folderId);
    } else {
      templates = await metadataService.getAllTemplates();
    }

    res.json({ templates });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// GET /api/metadata-templates/:id
export async function getTemplate(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const template = await metadataService.getTemplateById(id);

    if (!template) {
      return res.status(404).json({ error: 'Template non trouvé' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// POST /api/metadata-templates
export async function createTemplate(req: Request, res: Response) {
  try {
    const { name, fields, folderId } = req.body as {
      name: string;
      fields: MetadataField[];
      folderId?: string;
    };

    if (!name || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ error: 'Nom et champs requis' });
    }

    // Validate fields structure
    for (const field of fields) {
      if (!field.key || !field.label || !field.type) {
        return res.status(400).json({
          error: 'Chaque champ doit avoir key, label et type',
        });
      }
      if (!['text', 'date', 'number', 'select'].includes(field.type)) {
        return res.status(400).json({
          error: 'Type de champ invalide. Valeurs acceptées: text, date, number, select',
        });
      }
      if (field.type === 'select' && (!field.options || !Array.isArray(field.options))) {
        return res.status(400).json({
          error: 'Les champs select doivent avoir des options',
        });
      }
    }

    const template = await metadataService.createTemplate(name, fields, folderId);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// PATCH /api/metadata-templates/:id
export async function updateTemplate(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { name, fields, folderId } = req.body;

    // Check if template exists
    const existing = await metadataService.getTemplateById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Template non trouvé' });
    }

    // Validate fields if provided
    if (fields) {
      if (!Array.isArray(fields)) {
        return res.status(400).json({ error: 'Fields doit être un tableau' });
      }
      for (const field of fields) {
        if (!field.key || !field.label || !field.type) {
          return res.status(400).json({
            error: 'Chaque champ doit avoir key, label et type',
          });
        }
      }
    }

    const template = await metadataService.updateTemplate(id, { name, fields, folderId });
    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// DELETE /api/metadata-templates/:id
export async function deleteTemplate(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    // Check if template exists
    const existing = await metadataService.getTemplateById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Template non trouvé' });
    }

    // Check if template is in use
    if (existing._count.documents > 0) {
      return res.status(400).json({
        error: `Ce template est utilisé par ${existing._count.documents} document(s). Supprimez d'abord les métadonnées associées.`,
      });
    }

    await metadataService.deleteTemplate(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// GET /api/documents/:documentId/metadata
export async function getDocumentMetadata(req: Request, res: Response) {
  try {
    const documentId = req.params.documentId as string;
    const metadata = await metadataService.getDocumentMetadata(documentId);

    if (!metadata) {
      return res.json({ metadata: null });
    }

    res.json({ metadata });
  } catch (error) {
    console.error('Error getting document metadata:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// POST /api/documents/:documentId/metadata
export async function setDocumentMetadata(req: Request, res: Response) {
  try {
    const documentId = req.params.documentId as string;
    const { templateId, values } = req.body;

    if (!templateId || !values) {
      return res.status(400).json({ error: 'templateId et values requis' });
    }

    const metadata = await metadataService.setDocumentMetadata(documentId, templateId, values);
    res.status(201).json({ metadata });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error setting document metadata:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// PATCH /api/documents/:documentId/metadata
export async function updateDocumentMetadata(req: Request, res: Response) {
  try {
    const documentId = req.params.documentId as string;
    const { values } = req.body;

    if (!values) {
      return res.status(400).json({ error: 'values requis' });
    }

    const metadata = await metadataService.updateDocumentMetadata(documentId, values);
    res.json({ metadata });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error updating document metadata:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// DELETE /api/documents/:documentId/metadata
export async function deleteDocumentMetadata(req: Request, res: Response) {
  try {
    const documentId = req.params.documentId as string;

    const existing = await metadataService.getDocumentMetadata(documentId);
    if (!existing) {
      return res.status(404).json({ error: 'Métadonnées non trouvées' });
    }

    await metadataService.removeDocumentMetadata(documentId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting document metadata:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
