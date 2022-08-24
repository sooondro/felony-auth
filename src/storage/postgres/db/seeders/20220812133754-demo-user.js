'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'user',
      [
        {
          id: "7ff28057-c92d-4bf1-b132-9fa810060e5a",
          username: 'username1',
          first_name: 'firstname1',
          last_name: 'lastname1',
          email: 'email@email.com',
          password: 'password',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "c4cc923a-89e1-4902-a57b-87a8498ea128",
          username: 'username2',
          first_name: 'firstname2',
          last_name: 'lastname2',
          email: 'email2@email.com',
          password: 'password',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "70b21d7f-f51d-4c84-aca1-8ed055771f42",
          username: 'username3',
          first_name: 'firstname3',
          last_name: 'lastname3',
          email: 'email3@email.com',
          password: 'password',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user', null, {});
  }
};
