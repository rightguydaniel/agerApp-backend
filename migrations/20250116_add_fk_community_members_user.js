module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE CommunityMembers ADD CONSTRAINT fk_community_members_user FOREIGN KEY (user_id) REFERENCES Users(id) ON UPDATE CASCADE ON DELETE CASCADE;"
    );
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE CommunityMembers DROP FOREIGN KEY fk_community_members_user;"
    );
  },
};
