module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Invoices");

    if (!table.discounts) {
      await queryInterface.addColumn("Invoices", "discounts", {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      });
      return;
    }

    await queryInterface.sequelize.query(
      "UPDATE Invoices SET discounts = 0 WHERE discounts IS NULL;"
    );

    await queryInterface.changeColumn("Invoices", "discounts", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("Invoices");

    if (table.discounts) {
      await queryInterface.removeColumn("Invoices", "discounts");
    }
  },
};
