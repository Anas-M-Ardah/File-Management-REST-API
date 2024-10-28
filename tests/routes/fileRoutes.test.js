const request = require('supertest');
const app = require('../../server.js');

describe('File Routes', () => {

  // before each test, create a test file
  beforeEach(async () => {
    await request(app).post('/create').send({ fileName: 'test', fileContent: 'File Content' });
  });

  // after each test, delete the test file
  afterEach(async () => {
    await request(app).delete('/delete').send({ fileName: 'test.txt' });
  });

  it('GET / should render the file list', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('File List');
  });

  it('POST /create should create a file and redirect', async () => {
    const response = await request(app)
      .post('/create')
      .send({ fileName: 'newFile', fileContent: 'File content' });
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/');
  });

  it('GET /view/?fileName=test.txt should render file details', async () => {
    const response = await request(app).get('/view?fileName=test.txt');
    expect(response.status).toBe(200);
    expect(response.text).toContain('File Content');
  });

  it('POST /delete should delete a file and redirect', async () => {
    const response = await request(app).delete('/delete').send({ fileName: 'test.txt' });
    expect(response.status).toBe(200);
  });

  it('POST /edit should edit a file and redirect', async () => {
    const response = await request(app)
      .post('/edit?fileName=test.txt')
      .send({ fileName: 'test2.txt', fileContent: 'New File Content' });
    expect(response.status).toBe(302);
    // delete the test file
    await request(app).delete('/delete').send({ fileName: 'test2.txt' });
  });

  it('GET /download should download a file', async () => {
    const response = await request(app).get('/download?fileName=newFile.txt');
    expect(response.status).toBe(200);
    // delete the test file
    await request(app).delete('/delete').send({ fileName: 'test.txt' });
  });

});