import {RestApplication} from '@loopback/rest';
import {createRestAppClient, givenHttpServerConfig} from '@loopback/testlab';

import {NoteController} from './fixtures/controllers/note.controller';
import {NOTE_REPO_BINDING_KEY, NoteRepository} from './fixtures/repositories/note.repository';

export async function setupApplication() {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });
  const app = new RestApplication({
    rest: restConfig,
  });

  app.bind(NOTE_REPO_BINDING_KEY).to(new NoteRepository());
  app.controller(NoteController);
  await app.start();

  const client = createRestAppClient(app);
  return {app, client};
}
