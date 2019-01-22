import PublisherBase, { PublisherOptions } from '@electron-forge/publisher-base';
import { asyncOra } from '@electron-forge/async-ora';

import fs from 'fs-extra';
import path from 'path';

import { PublisherSnapcraftConfig } from './Config';

const Snapcraft = require('electron-installer-snap/src/snapcraft');

export default class PublisherSnapcraft extends PublisherBase<PublisherSnapcraftConfig> {
  name = 'snapcraft';

  async publish({ dir, makeResults }: PublisherOptions) {
    const artifacts = makeResults.reduce((flat, makeResult) => {
      flat.push(...makeResult.artifacts);
      return flat;
    }, [] as string[]);

    const snapArtifacts = artifacts.filter(artifact => artifact.endsWith('.snap'));

    if (snapArtifacts.length === 0) {
      throw new Error('No snap files to upload. Please ensure that "snap" is listed in the "make_targets" in Forge config.');
    }

    const snapcraftCfgPath = path.join(dir, '.snapcraft', 'snapcraft.cfg');

    if (!await fs.pathExists(snapcraftCfgPath)) {
      throw new Error(`Snapcraft credentials not found at "${snapcraftCfgPath}". It can be generated with the command "snapcraft export-login"`
        + '(snapcraft 2.37 and above).');
    }

    await asyncOra('Pushing snap to the snap store', async () => {
      const snapcraft = new Snapcraft();
      await snapcraft.run(dir, 'push', this.config, snapArtifacts);
    });
  }
}
