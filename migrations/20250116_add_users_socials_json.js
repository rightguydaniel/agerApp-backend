module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE Users ADD COLUMN socials JSON NULL;"
    );
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE Users DROP COLUMN socials;"
    );
  },
};
