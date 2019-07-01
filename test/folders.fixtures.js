function makeFoldersArray() {
  return [
    {
      id: 1,
      name: 'Test'
    },
    {
      id: 2,
      name: 'Dummy'
    },
    {
      id: 3,
      name: 'Garbage'
    },
  ];
}

function makeMaliciousFolder() {
  const maliciousFolder = {
    id: 911,
    name: 'Bad <script>alert("xss");</script>'
  }
  const expectedFolder = {
    ...maliciousFolder,
    name: 'Bad &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
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