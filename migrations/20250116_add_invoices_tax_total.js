module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Invoices", "tax", {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn("Invoices", "total", {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: null,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("Invoices", "total");
    await queryInterface.removeColumn("Invoices", "tax");
  },
};
