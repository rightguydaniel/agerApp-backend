module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Invoices");

    if (!table.discounts) {
      await queryInterface.addColumn("Invoices", "discounts", {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("Invoices");

    if (table.discounts) {
      await queryInterface.removeColumn("Invoices", "discounts");
    }
  },
};
