import assert from 'assert';
import AsyncTestUtil from 'async-test-util';

import * as humansCollection from '../helper/humans-collection';
import * as RxDatabase from '../../dist/lib/rx-database';
import * as RxSchema from '../../dist/lib/rx-schema';
import * as RxDocument from '../../dist/lib/rx-document';
import * as util from '../../dist/lib/util';

describe('local-documents.test.js', () => {
    describe('.insertLocal()', () => {
        describe('positive', () => {
            it('should create a local document', async () => {
                const c = await humansCollection.create();
                const doc = await c.insertLocal('foobar', {
                    foo: 'bar'
                });
                assert.ok(doc);
                c.database.destroy();
            });
            it('should not find the doc because its local', async () => {
                const c = await humansCollection.create(0);
                await c.insertLocal('foobar', {
                    foo: 'bar'
                });
                const doc2 = await c.findOne().exec();
                assert.equal(doc2, null);
                c.database.destroy();
            });
        });
        describe('negative', () => {
            it('should throw if already exists', async () => {
                const c = await humansCollection.create();
                const doc = await c.insertLocal('foobar', {
                    foo: 'bar'
                });
                assert.ok(doc);
                await AsyncTestUtil.assertThrows(
                    () => c.insertLocal('foobar', {
                        foo: 'bar2'
                    }),
                    Error,
                    'already exists'
                );
                c.database.destroy();
            });
        });
    });
    describe('.getLocal()', () => {
        describe('positive', () => {
            it('should find the document', async () => {
                const c = await humansCollection.create();
                await c.insertLocal('foobar', {
                    foo: 'bar'
                });
                const doc = await c.getLocal('foobar');
                assert.ok(doc);
                assert.equal(doc.get('foo'), 'bar');
                c.database.destroy();
            });
            it('should find the document twice (doc-cache)', async () => {
                const c = await humansCollection.create();
                await c.insertLocal('foobar', {
                    foo: 'bar'
                });
                const doc = await c.getLocal('foobar');
                const doc2 = await c.getLocal('foobar');
                assert.ok(doc);
                assert.ok(doc === doc2);
                c.database.destroy();
            });
        });
        describe('negative', () => {
            it('should not find non-existing', async () => {
                const c = await humansCollection.create();
                const doc = await c.getLocal('foobar');
                assert.equal(doc, null);
                c.database.destroy();
            });
        });
    });
    describe('.upsertLocal()', () => {
        describe('positive', () => {
            it('should insert when not exists', async () => {
                const c = await humansCollection.create();
                const doc = await c.upsertLocal('foobar', {
                    foo: 'bar'
                });
                assert.ok(doc);
                assert.equal(doc.get('foo'), 'bar');
                c.database.destroy();
            });
            it('should update when exists', async () => {
                const c = await humansCollection.create();
                await c.upsertLocal('foobar', {
                    foo: 'bar'
                });
                const doc = await c.upsertLocal('foobar', {
                    foo: 'bar2'
                });
                assert.ok(doc);
                assert.equal(doc.get('foo'), 'bar2');
                c.database.destroy();
            });
        });
        describe('negative', () => {});
    });
    describe('.remove()', () => {
        it('should remove the document', async () => {
            const c = await humansCollection.create();
            const doc = await c.upsertLocal('foobar', {
                foo: 'bar'
            });
            await doc.remove();
            const doc2 = await c.getLocal('foobar');
            assert.equal(doc2, null);

            c.database.destroy();
        });
    });
    describe('with database', () => {
        it('should be able to use local documents directly on the database', async () => {
            const c = await humansCollection.create();
            const db = c.database;

            const doc1 = await db.insertLocal('foobar', {
                foo: 'bar'
            });
            const doc2 = await db.getLocal('foobar');
            assert.equal(doc1, doc2);
            db.destroy();
        });
    });
    describe('multi-instance', () => {});
    describe('data-migration', () => {});
    describe('exxx', () => {
        it('e', () => process.exit());
    });
});
