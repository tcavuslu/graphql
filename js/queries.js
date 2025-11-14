// GraphQL queries for Zone01 API

export const queries = {
    // Get user information
    getUserInfo: `
        query {
            user {
                id
                login
                attrs
            }
        }
    `,

    // Get XP transactions
    getXPTransactions: `
        query {
            transaction(
                where: {
                    type: { _eq: "xp" }
                }
                order_by: { createdAt: asc }
            ) {
                id
                amount
                createdAt
                path
                object {
                    name
                    type
                }
            }
        }
    `,

    // Get user progress
    getProgress: `
        query {
            progress(order_by: { createdAt: desc }) {
                id
                grade
                createdAt
                path
                object {
                    name
                    type
                }
            }
        }
    `,

    // Get audit transactions (up/down)
    getAuditTransactions: `
        query {
            transaction(
                where: {
                    type: { _in: ["up", "down"] }
                }
            ) {
                type
                amount
            }
        }
    `,

    // Get all skill transactions
    getSkillTransactions: `
        query {
            transaction(
                where: {
                    type: { _like: "skill_%" }
                }
                order_by: { amount: desc }
            ) {
                type
                amount
                createdAt
            }
        }
    `
};
