'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'user',
      [
        {
          id: 1,
          username: 'username1',
          first_name: 'firstname1',
          last_name: 'lastname1',
          email: 'email@email.com',
          password: 'password',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          username: 'username2',
          first_name: 'firstname2',
          last_name: 'lastname2',
          email: 'email2@email.com',
          password: 'password',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
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
