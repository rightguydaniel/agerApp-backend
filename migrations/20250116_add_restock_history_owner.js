module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("RestockHistory", "owner_id", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("RestockHistory", "owner_id");
  },
};
