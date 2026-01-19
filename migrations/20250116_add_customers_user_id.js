module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Customers", "user_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("Customers", "user_id");
  },
};
