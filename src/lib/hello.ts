export function sayHello(name: string) {
  return `Hello ${name}`;
}

export function indexFunc() {
  return [
    {
      href: '/teams',
      methods: ['GET', 'POST'],
    },
    {
      href: '/teams/:slug',
      methods: ['GET', 'PATCH', 'DELETE'],
    },
    {
      href: '/games',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  ];
}
