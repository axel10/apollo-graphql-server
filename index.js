// apollo server:https://www.apollographql.com/docs/apollo-server/getting-started
const { ApolloServer, gql } = require('apollo-server');
// 以下到19行都是假数据
const users = [
    {
        id: "1",
        name: 'Elizabeth Bennet'
    },
    {
        id: "2",
        name: 'Fitzwilliam Darcy'
    }
];
const humans = [
    { id: '1', name: 'aak', height: 1000.1 }
]
const heros = [
    { id: '1', name: 'laowang', friends: ['2'], appearsIn: ['JEDI'] },
    { id: '2', name: 'laoliu', friends: ['1'], appearsIn: ['NEWHOPE'], primaryFunction: 'eat' }
]
// 定义schema，也就是要传给前端的接口文档。
const typeDefs = gql`
# 定义了User类，User的id属性是唯一标识符，感叹号表示非空，如果为空则报错。还有一个name属性是字符串类型
type User {
    id: ID!
    name: String
  }
# 枚举类型
 enum Episode  {
    NEWHOPE
    EMPIRE
    JEDI
  }

  enum LengthUnit{
      FOOT
      METER
  }

  type Starship {
    id: ID!
    name: String!
    length(unit: LengthUnit = METER): Float
  }
# 接口，和面向对象语言的接口概念基本一致。
  interface Character {
    id: ID!
    name: String!
    # 方括号指的是数组，表示传递的是Character列表。
    friends: [Character]
    # 括号外的感叹号指的是非空，但允许空数组。如果感叹号在括号内则不允许空数组
    appearsIn: [Episode]!
  }
  type Hero{
      id:ID!
      name:String
  }
  # Human和Droid类都实现了Character接口。
  type Human implements Character {
    id: ID!
    name: String!
    friends: [Character]
    appearsIn: [Episode]!
    starships: [Starship]
    totalCredits: Int
  }
  
  type Droid implements Character {
    id: ID!
    name: String!
    friends: [Character]
    appearsIn: [Episode]!
    primaryFunction: String
  }

  # 定义了开放给前端的查询接口。
  type Query {
    user(id: ID!): User,
    users:[User],
    human(id:ID!,unit:LengthUnit,withFriends:Boolean):Human,
    friends:[Human],
    heros:[Character],
    hero(id:ID!):Hero
  }
  # 定义了开放给前端的数据更改接口。
  type Mutation {
      addUser(name:String!):User
      addHero(name:String!):Hero
  }
`;
// 将数据与graphql对接
const resolvers = {
    // 处理查询接口。
    Query: {
        user(parent, args, context, info) {
            return users.find(user => user.id.toString() === args.id);
        },
        users() {
            return users
        },
        human(parent, args) {
            console.log(args.unit)
            return humans.find(h => h.id === args.id)
        },
        friends() {
            return humans
        },
        heros(...args) {
            console.log(args)
            return heros
        },
        hero(parent, args) {
            const id = args.id
            return heros.find(h => h.id === id)
        }
    },
    // 告诉graphql该怎么判断究竟是Human类还是Droid类，如果返回的数据中包含多个类则必需。对应官方文档的Inline Fragments部分。https://graphql.org/learn/queries/#inline-fragments
    Character: {
        __resolveType(character) {
            if ('primaryFunction' in character) {
                return "Droid"
            } else {
                return "Human"
            }
        }
    },
    Mutation: {
        addUser(parent, {name}) {
            var id = getNewId(users)
            var newUser = { id, name }
            users.push(newUser)
            return newUser
        },
        addHero(parent, {name}) {
            var id = getNewId(heros)
            var newHero = {id,name}
            heros.push(newHero)
            return newHero
        }
    }
}
function getNewId(arr) {
    return arr.map(u => parseInt(u.id)).sort()[arr.length - 1] + 1
}

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});