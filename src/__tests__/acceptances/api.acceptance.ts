import {Application} from '@loopback/core';

import {buildApiFromController, ControllerApi} from '../../api';
import {NoteController} from '../fixtures/controllers/note.controller';
import {NOTE_REPO_BINDING_KEY, NoteRepository} from '../fixtures/repositories/note.repository';
import {setupApplication} from '../helpers';

describe('api', () => {
  let app: Application;
  let client;
  let api: ControllerApi<NoteController>;

  let noteRepo: NoteRepository;

  beforeAll(async () => {
    ({app, client} = await setupApplication());
    api = buildApiFromController(client, NoteController);
  });

  beforeAll(async () => {
    noteRepo = await app.get(NOTE_REPO_BINDING_KEY);
  });

  afterAll(async () => {
    await app.stop();
  });

  beforeEach(async () => {
    await noteRepo.deleteAll();
  });

  it('create', async () => {
    await api.create().send({title: 'test', content: 'test'}).expect(200);
  });

  it('count', async () => {
    await noteRepo.create({title: 'test', content: 'test'});
    await api.count().expect(200).expect({count: 1});
  });

  it('find', async () => {
    await noteRepo.create({title: 'test', content: 'test'});
    await api
      .find()
      .expect(200)
      .expect(res => {
        expect(res.body).toMatchObject([{title: 'test', content: 'test'}]);
      });
  });

  it('findById', async () => {
    const note = await noteRepo.create({title: 'test', content: 'test'});
    const {body} = await api.findById({id: note.id}).expect(200);
    expect(body).toMatchObject({title: 'test', content: 'test'});
  });

  it('updateById', async () => {
    const note = await noteRepo.create({title: 'test', content: 'test'});
    await api.updateById({id: note.id}).expect(204);
  });

  it('replaceById', async () => {
    const note = await noteRepo.create({title: 'test', content: 'test'});
    await api.replaceById({id: note.id}).send({title: 'test-2', content: 'test-content-2'}).expect(204);
    const found = await noteRepo.findById(note.id);
    expect(found).toMatchObject({title: 'test-2', content: 'test-content-2'});
  });

  it('deleteById', async () => {
    const note = await noteRepo.create({title: 'test', content: 'test'});
    await api.deleteById({id: note.id}).expect(204);
  });
});
