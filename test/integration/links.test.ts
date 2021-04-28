import * as supertest from 'supertest';
import * as uuid from 'uuid';
import {expect} from 'chai';
import {eachSeries} from 'async';

const api = supertest('http://localhost:3000');

describe('/v1/links', function () {

  describe('when GET', function () {
    describe('and no items are yet added', function () {
      it('should return an empty collection', function (done) {
        api
          .get(`/v1/posts`)
          .set('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            const body = JSON.parse(res.text);

            expect(body).to.have.property('data')
              .and.have.lengthOf(0);
          })
          .expect(200, done);
      });
    });

    describe('and page[size]=2 and total=3', function () {
      before(function (done) {
        this.links = [
          {
            description: `description-${uuid.v4()}`,
          },
          {
            description: `description-${uuid.v4()}`,
          },
          {
            description: `description-${uuid.v4()}`,
          }
        ];

        eachSeries(this.links, function (item: any, cb) {
          api.post('/v1/links')
            .set('Content-Type', 'application/vnd.api+json')
            .send(JSON.stringify({
              data: {
                type: 'link',
                attributes: item
              }
            }))
            .expect(function (res) {
              const body = JSON.parse(res.text);
              item.id = body.data.id;
            })
            .expect(201, cb);
        }, done);
      });

      after(function (done) {
        eachSeries(this.links, function (item: any, cb) {
          api.delete('/v1/links/' + item.id)
            .expect(204, cb);
        }, done);
      });

      it('should return the list reflecting the proper pagination object', function (done) {
        api
          .get(`/v1/links`)
          .set('Content-Type', 'application/vnd.api+json')
          .query({
            page: {
              size: 2
            }
          })
          .expect(function (res) {
            const body = JSON.parse(res.text);

            expect(body).to.have.property('links')
              .and.have
              .keys([
                'next'
              ]);

            expect(body).to.have.property('data')
              .and.have.lengthOf(2);
          })
          .expect(200, done);
      });
    });
  });

  describe('when POST', function () {
    describe('and creating a valid post', function () {
      it('should create a post and return a valid JSON API response', function (done) {
        let self = this;
        self.postId = null;

        after(function (done) {
          api.delete('/v1/posts/' + self.postId)
            .expect(204, done);
        });

        api
          .post('/v1/posts')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            data: {
              type: 'post',
              attributes: {
                title: `title-${uuid.v4()}`,
                authorId: self.userId
              }
            }
          }))
          .expect(function (res) {
            const body = JSON.parse(res.text);

            expect(body).to.have.property('data')
              .and.have
              .keys([
                'id',
                'type',
                'attributes',
                'links'
              ]);

            self.postId = body.data.id;

            expect(body.data.attributes).to.have.keys([
              'title',
              'authorId',
              'createdAt',
              'updatedAt'
            ]);
          })
          .expect(201, done);
      });
    });
  });

  describe('/v1/posts/{postId}', function () {
    describe('when GET ', function () {
      describe('a valid post', function () {
        before(function (done) {
          let self = this;

          self.tags = [
            'math',
            'physics'
          ];

          api.post('/v1/posts')
            .set('Content-Type', 'application/vnd.api+json')
            .send(JSON.stringify({
              data: {
                type: 'post',
                attributes: {
                  title: `title-${uuid.v4()}`,
                  authorId: self.userId,
                  tags: self.tags
                }
              }
            }))
            .expect(function (res) {
              const body = JSON.parse(res.text);
              self.postId = body.data.id;
            })
            .expect(201, done);
        });

        after(function (done) {
          api.delete('/v1/posts/' + this.postId)
            .expect(204, done);
        });

        it('should return a valid post response', function (done) {
          let self = this;

          api
            .get(`/v1/posts/${self.postId}`)
            .set('Content-Type', 'application/vnd.api+json')
            .expect(function (res) {
              const body = JSON.parse(res.text);

              expect(body).to.have.property('data')
                .and.have
                .keys([
                  'id',
                  'type',
                  'attributes',
                  'links'
                ]);

              expect(body.data.id).to.be.eq(self.postId);

              expect(body.data.attributes).to.have.keys([
                'title',
                'authorId',
                'tags',
                'createdAt',
                'updatedAt'
              ]);

              expect(body.data.attributes.tags).to.be.eql(self.tags);
            })
            .expect(200, done);
        });
      });
    });

    describe('when DELETE ', function () {
      describe('a valid post', function () {
        before(function (done) {
          let self = this;

          api.post('/v1/posts')
            .set('Content-Type', 'application/vnd.api+json')
            .send(JSON.stringify({
              data: {
                type: 'post',
                attributes: {
                  title: `title-${uuid.v4()}`,
                  authorId: this.userId
                }
              }
            }))
            .expect(function (res) {
              const body = JSON.parse(res.text);
              self.postToDeleteId = body.data.id;
            })
            .expect(201, done);
        });

        it('should return a valid response', function (done) {
          api.delete('/v1/posts/' + this.postToDeleteId)
            .expect(204, done);
        });
      });
    });

    describe('when PATCH', function () {
      describe('a valid post', function () {
        describe('with valid update values', function () {
          before(function (done) {
            let self = this;

            self.tags = [
              'math',
              'physics'
            ];

            api.post('/v1/posts')
              .set('Content-Type', 'application/vnd.api+json')
              .send(JSON.stringify({
                data: {
                  type: 'post',
                  attributes: {
                    title: `title-${uuid.v4()}`,
                    authorId: self.userId,
                    tags: self.tags
                  }
                }
              }))
              .expect(function (res) {
                const body = JSON.parse(res.text);
                self.postId = body.data.id;
              })
              .expect(201, done);
          });

          after(function (done) {
            api.delete('/v1/posts/' + this.postId)
              .expect(204, done);
          });

          it('should update the values and return the updated data', function (done) {
            let self = this;
            self.someOtherPost = `some-other-post-title-${uuid.v4()}`;
            self.newTags = [
              'nature',
              'pharmaceutical',
              'space'
            ];

            api
              .patch('/v1/posts/' + self.postId)
              .set('Content-Type', 'application/vnd.api+json')
              .send(JSON.stringify({
                data: {
                  type: 'post',
                  id: self.postId,
                  attributes: {
                    title: self.someOtherPost,
                    authorId: self.userId,
                    tags: self.newTags
                  }
                }
              }))
              .expect(function (res) {
                const body = JSON.parse(res.text);

                expect(body).to.have.property('data')
                  .and.have
                  .keys([
                    'id',
                    'type',
                    'attributes',
                    'links'
                  ]);

                expect(body.data.id).to.be.eq(self.postId);

                expect(body.data.attributes).to.have.keys([
                  'title',
                  'authorId',
                  'tags',
                  'createdAt',
                  'updatedAt'
                ]);

                expect(body.data.attributes.title).to.be.eq(self.someOtherPost);
                expect(body.data.attributes.tags).to.be.eql(self.newTags);
              })
              .expect(200, done);
          });
        });
      });
    });
  });
});
