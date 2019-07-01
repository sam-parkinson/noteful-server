function makeNotesArray() {
  return [
    {
      id: 1,
      note_name: 'Dogs',
      modified: '2019-01-03T00:00:00.000Z',
      folder_id: 1,
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
    },
    {
      id: 2,
      note_name: 'Cats',
      modified: '2018-08-15T23:00:00.000Z',
      folder_id: 2,
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
    },
    {
      id: 3,
      note_name: 'Pigs',
      modified: '2018-03-01T00:00:00.000Z',
      folder_id: 3,
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
    },
    {
      id: 4,
      note_name: 'Birds',
      modified: '2019-01-04T00:00:00.000Z',
      folder_id: 1,
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
    },
    {
      id: 5,
      note_name: 'Bears',
      modified: '2018-07-12T23:00:00.000Z',
      folder_id: 2,
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
    },
  ];
}

function makeMaliciousNote() {
  const maliciousNote = { // update with xss attack
    id: 911,
    note_name: 'Bad dogs <script>alert("xss");</script>',
    modified: '2019-01-03T00:00:00.000Z',
    folder_id: 1,
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }
  const expectedNote = {
    ...maliciousNote,
    note_name: 'Bad dogs &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }

  return {
    maliciousNote,
    expectedNote
  }
}

module.exports = {
  makeNotesArray,
  makeMaliciousNote
}