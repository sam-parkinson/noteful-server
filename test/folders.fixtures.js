function makeFoldersArray() {
  return [
    {
      id: 1,
      folder_name: 'Test',
    },
    {
      id: 2,
      folder_name: 'Dummy',
    },
    {
      id: 3,
      folder_name: 'Garbage',
    },
  ];
}

function makeMaliciousFolder() {
  const maliciousFolder = {
    id: 911,
    folder_name: 'Bad <script>alert("xss");</script>'
  }
  const expectedFolder = {
    ...maliciousFolder,
    folder_name: 'Bad &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
  }
  return {
    maliciousFolder,
    expectedFolder
  }
}

module.exports = {
  makeFoldersArray,
  makeMaliciousFolder
}