// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DefaultCrudRepository, juggler} from '@loopback/repository';

import {Note, NoteRelations} from '../models/note.model';

export const NOTE_REPO_BINDING_KEY = 'repositories.myrepo';

export class NoteRepository extends DefaultCrudRepository<Note, typeof Note.prototype.id, NoteRelations> {
  constructor(
    ds: juggler.DataSource = new juggler.DataSource({
      connector: 'memory',
    }),
  ) {
    super(Note, ds);
  }
}
