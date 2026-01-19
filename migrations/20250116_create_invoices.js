module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Invoices", {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Customers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      customer_details: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      products: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      narration: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      delivery_fees: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      auto_approve: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Invoices");
  },
};
