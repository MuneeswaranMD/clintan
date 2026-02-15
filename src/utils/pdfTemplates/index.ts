import { modernTemplate } from './modern';
import { classicTemplate } from './classic';
import { minimalTemplate } from './minimal';
import { corporateTemplate } from './corporate';

export const pdfTemplates = {
    modern: modernTemplate,
    classic: classicTemplate,
    minimal: minimalTemplate,
    corporate: corporateTemplate
};

export type TemplateId = keyof typeof pdfTemplates;
