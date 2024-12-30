interface Props {
  isFollowing: boolean;
}

export const FollowButton = ({ isFollowing }: Props) => {
  function handleOnFollow() {
    alert(`현재 팔로우 상태:${isFollowing}`);
  }

  if (isFollowing)
    return (
      <button
        className="px-2.5 py-1 text-10 label-selected"
        onClick={handleOnFollow}
      >
        팔로잉
      </button>
    );

  return (
    <button
      className="px-2.5 py-1 text-10 label-default"
      onClick={handleOnFollow}
    >
      팔로우
    </button>
  );
};
