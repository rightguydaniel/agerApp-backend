import { Request, Response } from "express";
import Users from "../../models/Users";
import RestockHistory from "../../models/RestockHistory";
import Products from "../../models/Products";
import Invoices from "../../models/Invoices";
import Customers from "../../models/Customers";
import CommunityMembers from "../../models/CommunityMembers";
import Communities from "../../models/Communities";
import UserBankDetails from "../../models/UserBankDetails";
import UserSettings from "../../models/UserSettings";
import Tokens from "../../models/Tokens";
import AccountDeletionTokens from "../../models/AccountDeletionTokens";
import sendResponse from "../../utils/http/sendResponse";

export const deleteUser = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    if (!id) {
      sendResponse(response, 400, "User ID is required");
      return;
    }

    const user = await Users.findByPk(id);

    if (!user) {
      sendResponse(response, 404, "User not found");
      return;
    }

    // Cascade delete in order of dependencies
    // 1. Delete RestockHistory
    await RestockHistory.destroy({
      where: { owner_id: id },
    });

    // 2. Delete Products
    await Products.destroy({
      where: { owner_id: id },
    });

    // 3. Delete Invoices
    await Invoices.destroy({
      where: { owner_id: id },
    });

    // 4. Delete Customers
    await Customers.destroy({
      where: { owner_id: id },
    });

    // 5. Delete CommunityMembers (where user is a member)
    await CommunityMembers.destroy({
      where: { user_id: id },
    });

    // 6. Delete Communities created by user and their members
    const userCommunities = await Communities.findAll({
      where: { created_by: id },
    });

    for (const community of userCommunities) {
      await CommunityMembers.destroy({
        where: { community_id: community.id },
      });
    }

    await Communities.destroy({
      where: { created_by: id },
    });

    // 7. Delete UserBankDetails
    await UserBankDetails.destroy({
      where: { user_id: id },
    });

    // 8. Delete UserSettings
    await UserSettings.destroy({
      where: { user_id: id },
    });

    // 9. Delete Tokens (OTP tokens)
    await Tokens.destroy({
      where: { email: user.email },
    });

    // 10. Delete AccountDeletionTokens
    await AccountDeletionTokens.destroy({
      where: { user_id: id },
    });

    // 11. Finally, delete the User
    await Users.destroy({
      where: { id },
    });

    sendResponse(
      response,
      200,
      "User and all associated data deleted successfully",
      null
    );
  } catch (error: any) {
    console.error("Error deleting user", error.message);
    sendResponse(response, 500, "Failed to delete user", error.message);
  }
};

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user and all associated data
 *     description: Permanently deletes a user and all their related data including products, invoices, customers, and communities. This cannot be undone. Requires admin authentication.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User and all associated data deleted successfully.
 *       400:
 *         description: Missing user ID.
 *       401:
 *         description: Authentication token missing or invalid.
 *       403:
 *         description: Authenticated user is not an admin.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error while deleting user.
 */
