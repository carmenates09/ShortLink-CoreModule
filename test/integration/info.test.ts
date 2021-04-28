import * as supertest from 'supertest';
import { expect }     from 'chai';

const api = supertest('http://localhost:3000');

describe('/v1/info', function () {
  describe('when GET', function () {
    it('should return a valid `info` collection', function (done) {
      api
        .get('/v1/info')
        .set('Accept', 'application/vnd.api+json')
        .expect('Content-Type', 'application/vnd.api+json; charset=utf-8')
        .expect(function (res) {
          const body = JSON.parse(res.text);

          expect(body).to.have.property('data');
          expect(body.data).to.have.lengthOf(1);

          body.data.forEach(function (item) {
            expect(item).to.have.keys([
              'id',
              'type',
              'attributes',
              'links'
            ]);

            expect(item.id).to.be.oneOf([
              'current-time'
            ]);

            expect(item.attributes).to.have.property('value').and.be.a('string');
            expect(item.links).to.have.property('self').and.be.a('string');
          });
        })
        .expect(200, done);
    });
  });

  describe('/v1/info/{infoId}', function () {
    describe('when GET', function () {
      describe('and `infoId = "current-time"`', function () {
        it('should return a valid `info/current-time` item', function (done) {
          api
            .get('/v1/info/current-time')
            .set('Accept', 'application/vnd.api+json')
            .expect('Content-Type', 'application/vnd.api+json; charset=utf-8')
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

              expect(body.data.id).to.be.equal('current-time');
              expect(body.data.attributes).to.have.property('value').and.be.a('string');
              expect(body.data.links).to.have.property('self').and.be.a('string');
            })
            .expect(200, done);
        });
      });

      describe('and `infoId = "invalid"`', function () {
        it('should return a 404 response', function (done) {
          api
            .get('/v1/info/invalid')
            .set('Accept', 'application/vnd.api+json')
            .expect('Content-Type', 'application/vnd.api+json; charset=utf-8')
            .expect(function (res) {
              const body = JSON.parse(res.text);

              expect(body).to.have.property('errors');
              expect(body.errors).to.have.lengthOf(1);

              expect(body.errors[0]).to.have.keys([
                'status',
                'title',
                'source'
              ]);

              expect(body.errors[0].status).to.be.equal(404);
              expect(body.errors[0].title).to.be.a('string');
              expect(body.errors[0].source).to.have.keys([
                'parameter'
              ]);
              expect(body.errors[0].source.parameter).to.be.equal('infoId');
            })
            .expect(404, done);
        });
      });
    });
  });
});
