/**
 * Default markdown components
 * These are used when no custom components are provided
 */

import type { Components } from 'react-markdown';
import H1 from './h1.js';
import H2 from './h2.js';
import H3 from './h3.js';
import H4 from './h4.js';
import H5 from './h5.js';
import H6 from './h6.js';
import P from './p.js';
import A from './a.js';
import Img from './img.js';
import Code from './code.js';
import Pre from './pre.js';
import Blockquote from './blockquote.js';
import Ul from './ul.js';
import Ol from './ol.js';
import Li from './li.js';
import Table from './table.js';
import Thead from './thead.js';
import Tbody from './tbody.js';
import Tr from './tr.js';
import Th from './th.js';
import Td from './td.js';
import Hr from './hr.js';
import Strong from './strong.js';
import Em from './em.js';

/**
 * Default markdown components that will be used if no custom components are provided
 * These components from the components/markdown folder will be used.
 * If a component is not provided here, Tailwind's prose classes will handle the styling.
 */
export const defaultMarkdownComponents: Partial<Components> = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: P,
  a: A,
  img: Img,
  code: Code,
  pre: Pre,
  blockquote: Blockquote,
  ul: Ul,
  ol: Ol,
  li: Li,
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
  hr: Hr,
  strong: Strong,
  em: Em,
};

