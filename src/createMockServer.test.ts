import path from 'path';
import { createMockServer } from './createMockServer';

const schemaPath = path.resolve(__dirname, '../introspection.schema.graphql');

describe('createMockServer', () => {
  it('creates a new mock server', () => {
    const server = createMockServer({ schemaPath });

    expect(server).toHaveProperty('query');
  });

  it('provides an auto-mocked server given the provided schema', async () => {
    const server = createMockServer({
      schemaPath,
    });

    const res = await server.query(
      `
      query todo($id: ID!) {
        todo(id: $id) {
          id
          title
        }
      }
    `,
      {
        id: 1,
      }
    );

    expect(res).toHaveProperty('data.todo.id');
    expect(res).toHaveProperty('data.todo.title');
    expect(typeof res.data?.todo?.id).toBe('string');
    expect(typeof res.data?.todo?.title).toBe('string');
  });

  it('allows manual mocking of queries when providing a custom mock', async () => {
    const server = createMockServer({
      schemaPath,
      mocks: {
        Query: () => ({
          todo: () => ({
            id: 'xyz',
            title: 'I am manually mocked!',
          }),
        }),
      },
    });

    const res = await server.query(
      `
      query todo($id: ID!) {
        todo(id: $id) {
          id
          title
        }
      }
    `,
      {
        id: 1,
      }
    );

    expect(res).toEqual({
      data: {
        todo: {
          id: 'xyz',
          title: 'I am manually mocked!',
        },
      },
    });
  });

  it('preserves auto-mocking when providing manual mocks', async () => {
    const server = createMockServer({
      schemaPath,
      mocks: {
        Query: () => ({
          todo: () => ({
            id: 'xyz',
            title: 'I am manually mocked!',
          }),
        }),
      },
    });

    const res = await server.query(
      `
      query photo($id: ID!) {
        photo(id: $id) {
          id
          title
        }
      }
    `,
      {
        id: 1,
      }
    );

    expect(res).toHaveProperty('data.photo.id');
    expect(res).toHaveProperty('data.photo.title');
    expect(typeof res.data?.photo?.id).toBe('string');
    expect(typeof res.data?.photo?.title).toBe('string');
  });
});
