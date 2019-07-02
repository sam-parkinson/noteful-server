const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray, makeMaliciousFolder } = require('./folders.fixtures');

describe('Folders Endpoints', function() {
  let db;
  
  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);

  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'));

  afterEach('cleanup', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'));

  describe('GET /api/folders', () => {
    context(`Given no folders`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, []);
      });
    });

    context(`Given there are folders in the database`, () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into(`noteful_folders`)
          .insert(testFolders)
      });

      it('responds with 200 and all folders', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, testFolders)
      });
    });

    context('Given an XSS attack folder', () => {
      const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

      beforeEach('insert folders', () => {
        return db
          .into(`noteful_folders`)
          .insert([ maliciousFolder ])
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200)
          .expect(res => {
            expect(res.body[0].folder_name).to.eql(expectedFolder.folder_name)
          })
      });
    });
  });

  describe(`GET /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folder_id = 123456;
        return supertest(app)
          .get(`/api/folders/${folder_id}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      });
    });

    context(`Given there are folders in the database`, () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
      });

      it('responds with 200 and the specified folder', () => {
        const folder_id = 2;
        const expectedFolder = testFolders[folder_id - 1];
        return supertest(app)
          .get(`/api/folders/${folder_id}`)
          .expect(200, expectedFolder)
      });
    });
    
    context(`Given an XSS attack folder`, () => {
      const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

      beforeEach('insert malicious folder', () => {
        return db
          .into('noteful_folders')
          .insert([ maliciousFolder ])
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/folders/${maliciousFolder.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.folder_name).to.eql(expectedFolder.folder_name)
          });
      });
    });
  });

  describe(`POST /api/folders`, () => {
    it(`creates a new folder, responding with 201 and the folder`, () => {
      const newFolder = {
        folder_name: 'FooBar'
      }

      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.folder_name).to.eql(newFolder.folder_name)
        })
        .then(res =>
          supertest(app)
            .get(`/api/folders/${res.body.id}`)
            .expect(res.body)
        )
    });

    it('responds with 400 and an error message when the folder name is missing', () => {
      const namelessFolder = {}

      return supertest(app)
        .post('/api/folders')
        .send(namelessFolder)
        .expect(400, {
          error: { message: `Missing folder name in request body` }
        });
    });

    it('removes XSS attack content from response', () => {
      const { maliciousFolder, expectedFolder } = makeMaliciousFolder();
      return supertest(app)
        .post(`/api/folders`)
        .send(maliciousFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.folder_name).to.eql(expectedFolder.folder_name)
        });
    });
  });

  describe(`DELETE /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folder_id = 123456;
        return supertest(app)
          .delete(`/api/folders/${folder_id}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      });
    });

    context(`Given there are folders in the database`, () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
      });

      it('responds with 204 and removes the folder', () => {
        const idToRemove = 2;
        const expectedFolders = testFolders.filter(folder => folder.id !== idToRemove);
        return supertest(app)
          .delete(`/api/folders/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get('/api/folders')
              .expect(expectedFolders)
          )
      });
    });
  });

  describe(`PATCH /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folder_id = 123456;
        return supertest(app)
          .patch(`/api/folders/${folder_id}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      });
    });

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
      });

      it('responds with 204 and updates the folder', () => {
        const idToUpdate = 2
        const updateFolder = {
          folder_name: 'Trash'
        }
        const expectedFolder = {
          ...testFolders[idToUpdate - 1],
          ...updateFolder
        }
        return supertest(app)
          .patch(`/api/folders/${idToUpdate}`)
          .send(updateFolder)
          .expect(204)
          .then(res => 
            supertest(app)
              .get(`/api/folders/${idToUpdate}`)
              .expect(expectedFolder)  
          )
      });

      it ('responds with 400 when name not supplied', () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/folders/${idToUpdate}`)
          .send({ random: 'Rover' })
          .expect(400, {
            error: { message: `Request body must include folder name` }
          });
      });
    });
  });
});