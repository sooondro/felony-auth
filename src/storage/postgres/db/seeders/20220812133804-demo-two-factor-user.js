'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'two_factor_user',
      [
        {
          id: 1,
          user_id: 1,
          secret: "secret1",
          provider: "TOTP",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          user_id: 3,
          secret: "secret2",
          provider: "TOTP",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('two_factor_user', null, {});
  }
};
