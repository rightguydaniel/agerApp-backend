module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserSettings", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      notification: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      taxes_rate: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      taxes_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      language: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable("UserSettings");
  },
};
