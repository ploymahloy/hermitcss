import './bootstrap/legacy-layers.css';
import hermitIsland from './widget.hcss';

import { injectHermitStyleTag } from 'hermitcss/inject';

injectHermitStyleTag(hermitIsland, { document, id: 'hermit-bootstrap-demo-styles' });
