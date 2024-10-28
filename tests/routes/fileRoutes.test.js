import request from 'supertest';
import app from '../../server.js'; 

describe('File Routes', () => {
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

  it('GET /view/:fileName should render file details', async () => {
    const response = await request(app).get('/view/test.txt');
    expect(response.status).toBe(200);
    expect(response.text).toContain('File Content');
  });
});
