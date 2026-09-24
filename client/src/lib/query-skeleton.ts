type QueryLike = {
  isPending: boolean;
  isFetching: boolean;
  data: unknown;
};

export function showQuerySkeleton(query: QueryLike): boolean {
  return query.isPending || (query.isFetching && query.data == null);
}
